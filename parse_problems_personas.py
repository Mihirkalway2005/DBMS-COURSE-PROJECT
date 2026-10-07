with open("presentation1/presentation_part1_slides_1-4.html") as f:
    t1 = f.read()

import re
pos_prob = t1.find("01 / The Problem")
print("PROBLEM SLIDE:")
print(t1[pos_prob:pos_prob+1500])

pos_roles = t1.find("02 / Who Uses This")
print("\nROLES SLIDE:")
print(t1[pos_roles:pos_roles+1500])
