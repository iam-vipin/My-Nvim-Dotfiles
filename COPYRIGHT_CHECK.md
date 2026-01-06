## Copyright check

To verify that all tracked Python files contain the correct copyright header for **Plane Software Inc.** for the year **2023**, run this command from the repository root:

```bash
addlicense --check -f COPYRIGHT.txt -ignore "**/migrations/**" $(git ls-files '*.py')
```

To Apply changes

```bash
addlicense -v -f COPYRIGHT.txt -ignore "**/migrations/**" $(git ls-files '*.py')
```

**Notes**

- **`addlicense -check`**: runs in check-only mode and fails if any file is missing or has an incorrect header.
- **`-c "Plane Software Inc."`**: sets the copyright holder.
- **`-f LICENSE.txt`**: uses the contents and format defined in `LICENSE.txt` as the header template.
- **`-y 2023`**: sets the year in the header.
- **`$(git ls-files '*.py')`**: restricts the check to Python files tracked in git.
