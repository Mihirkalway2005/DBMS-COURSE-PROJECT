with open("presentation2/presentation_part2_slides_5-9.html") as f:
    t = f.read()

pos = t.find("06 / Schema — Core Tables")
print(t[pos:pos+1500])
