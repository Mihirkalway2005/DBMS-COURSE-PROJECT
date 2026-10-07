with open("presentation2/presentation_part2_slides_5-9.html") as f:
    t = f.read()

import re
# Print all table nodes in the ERD
erd_tables = re.findall(r'\{id:`([^`]+)`,name:`([^`]+)`.+?desc:`([^`]+)`\}', t)
for item in erd_tables:
    print(item[0], "-->", item[2])
