with open("server/api.ts") as f:
    content = f.read()

# We will inject the PUT /api/licenses/:id handler right after DELETE /api/licenses/:id
put_endpoint = '''
        // 5b. Update License (Edit existing license fields: seats, cost, status, expiry)
        if (url.startsWith("/api/licenses/") && req.method === "PUT") {
          if (!client) return sendJson(res, 500, { error: "Database client unavailable" })
          try {
            const id = Number(url.replace("/api/licenses/", ""))
            const body = await readJsonBody(req)

            const existing = await client.license.findUnique({
              where: { id },
              include: { software: true }
            })
            if (!existing) {
              return sendJson(res, 404, { success: false, error: "License not found" })
            }

            const totalSeats = body.seats !== undefined ? Number(body.seats) : existing.totalSeats
            if (totalSeats < existing.allocatedSeats) {
              return sendJson(res, 400, {
                success: false,
                error: `Capacity error: Cannot set total seats (${totalSeats}) below currently allocated active seats (${existing.allocatedSeats}).`
              })
            }

            const rawCost = body.cost !== undefined ? Number(String(body.cost).replace(/[^0-9.]/g, "")) : Number(existing.totalCost)
            if (rawCost <= 0) {
              return sendJson(res, 400, { success: false, error: "Total cost must be a positive value > 0." })
            }
            const unitCost = Number((rawCost / totalSeats).toFixed(2))

            // Update software name or category if provided
            if (body.name || body.category) {
              await client.software.update({
                where: { id: existing.softwareId },
                data: {
                  name: body.name || undefined,
                  category: body.category || undefined,
                }
              })
            }

            const updated = await client.license.update({
              where: { id },
              data: {
                totalSeats,
                totalCost: rawCost,
                unitCost,
                status: body.status || undefined,
                licenseType: body.rawType || body.type || undefined,
                billingCycle: body.billingCycle || undefined,
                expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
                autoRenew: body.autoRenew !== undefined ? Boolean(body.autoRenew) : undefined,
              },
              include: {
                software: { include: { vendor: true } }
              }
            })

            return sendJson(res, 200, { success: true, license: updated })
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            return sendJson(res, 500, { success: false, error: message })
          }
        }
'''

target = 'await client.license.delete({ where: { id } })\n            return sendJson(res, 200, { success: true, deletedId: id })\n          } catch (err: unknown) {\n            const message = err instanceof Error ? err.message : String(err)\n            return sendJson(res, 500, { success: false, error: message })\n          }\n        }'

if target in content:
    content = content.replace(target, target + "\n" + put_endpoint)
    with open("server/api.ts", "w") as f:
        f.write(content)
    print("Successfully added PUT /api/licenses/:id handler")
else:
    print("Could not find exact target string")
