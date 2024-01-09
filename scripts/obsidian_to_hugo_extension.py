import os

from obsidian_to_hugo import ObsidianToHugo

def add_appropriate_yaml_header(title, date, content):
    """
    Adds the appropriate YAML header to the file.
    """
    return """
---
title: {}
date: {}
---
{}
""".format(title, date, content)

class ObsidianToHugoOverride(ObsidianToHugo):

    def process_content(self) -> None:
        """
        Looping through all files in the hugo content directory and replace the
        wiki links of each matching file.
        """
        for root, dirs, files in os.walk(self.hugo_content_dir):
            for file in files:
                if not file.endswith(".md"):
                    continue
                title = file[:-3]
                timestamp = os.stat(os.path.join(root, file)).st_mtime
                date = datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d")
                content = None
                with open(os.path.join(root, file), "r", encoding="utf-8") as f:
                    content = f.read()
                # If the file matches any of the filters, delete it.
                keep_file = True
                for filter in self.filters:
                    if not filter(content, file):
                        os.remove(os.path.join(root, file))
                        keep_file = False
                        break
                if not keep_file:
                    continue
                for processor in self.processors:
                    content = processor(content)
                print(add_appropriate_yaml_header(title, date, content))
                with open(os.path.join(root, file), "w", encoding="utf-8") as f:
                    f.write(add_appropriate_yaml_header(title, date, content))


def main():
    ObsidianToHugoOverride(
        hugo_content_dir="content/notes",
        obsidian_vault_dir="obsidian/Public",
    ).run()

if __name__ == '__main__':
    main()
