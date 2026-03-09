import os
import re

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                # Check if word Theme is present, but no import of Theme
                if re.search(r'\bTheme\b', content) and not re.search(r'import.*Theme', content):
                    print(f"Missing Theme import in {path}")
