import os
import re

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'Theme.' in content and 'import { Theme }' not in content and 'import Theme' not in content:
                    print(f"Missing Theme import in {path}")
