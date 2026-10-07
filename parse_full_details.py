with open("presentation2/presentation_part2_slides_5-9.html") as f:
    t = f.read()

import re
# print ERD nodes exactly
pos_erd = t.find("id:`VENDOR`")
print("ERD nodes:")
print(t[pos_erd-50:pos_erd+2600])

print("\n" + "="*50 + "\n")
pos_rules = t.find("08 / Integrity Rules")
print("Rules details:")
print(t[pos_rules:pos_rules+2500])
