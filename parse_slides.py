with open("presentation2/presentation_part2_slides_5-9.html") as f:
    t = f.read()

import re

# find arrays of objects in javascript
blocks = re.findall(r'(\[(?:\{[^{}]+\},?\s*)+\])', t)
print(f"Total blocks found: {len(blocks)}")
for i, b in enumerate(blocks):
    if any(k in b for k in ["Cardinalities", "Schema", "Core Tables", "Integrity Rules", "FOREIGN KEY", "allocated_seats", "Audit", "Renewal"]):
        print(f"\n--- Block {i} ---")
        print(b[:1200])
