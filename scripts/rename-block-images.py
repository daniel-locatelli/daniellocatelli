#!/usr/bin/env python3
"""
Rename Notion-style block-ID image files to human-readable names
derived from their alt text in markdown content files.
"""

import os
import re
import glob
import shutil
from pathlib import Path

ROOT = r"C:\repos\daniellocatelli"
ASSETS_DIR = os.path.join(ROOT, "src", "assets", "content")
CONTENT_DIR = os.path.join(ROOT, "src", "content")

# Regex to find block image references in markdown (with DOTALL for multi-line alt text)
BLOCK_REF_PATTERN = re.compile(
    r'!\[(.*?)\]\((.*?/(block-[a-f0-9]+-[a-f0-9]+-[a-f0-9]+-[a-f0-9]+-[a-f0-9]+\.\w+))\)',
    re.DOTALL
)

# Prefixes to strip from alt text before slugifying
PHOTO_PREFIXES = re.compile(
    r'^(Photo of|Foto de|Foto da|Foto do|Foto dos|Foto das|Foto des|Foto der|Foto vom|Foto von)\s+',
    re.IGNORECASE
)

FIGURE_PREFIXES = re.compile(
    r'^(Figure|Figura|Abbildung)\s+\d+[\s.:\-]*[\s\-]*',
    re.IGNORECASE
)

COPYRIGHT_PATTERN = re.compile(
    r'\s*[©]\s*[A-Za-z\u00C0-\u024F\s]+\.?\s*$',
    re.IGNORECASE
)

# Also handle "Copyright ..." at the end
COPYRIGHT_WORD_PATTERN = re.compile(
    r'\s*Copyright\s+[A-Za-z\u00C0-\u024F\s]+\.?\s*$',
    re.IGNORECASE
)


def slugify(text, max_len=80):
    """Convert text to a URL/filename-friendly slug."""
    # Normalize whitespace (including newlines)
    text = re.sub(r'\s+', ' ', text).strip()

    # Strip copyright notices
    text = COPYRIGHT_PATTERN.sub('', text)
    text = COPYRIGHT_WORD_PATTERN.sub('', text)
    text = text.strip().rstrip('.')

    # Strip figure numbering prefixes
    text = FIGURE_PREFIXES.sub('', text)
    text = text.strip()

    # Strip "Photo of" style prefixes, but only if there's more text after
    stripped = PHOTO_PREFIXES.sub('', text)
    if stripped.strip():
        text = stripped.strip()

    # Lowercase
    text = text.lower()

    # Replace common chars
    text = text.replace('&', 'and')
    text = text.replace('+', 'plus')

    # Replace accented characters with ASCII equivalents
    replacements = {
        'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a', 'å': 'a',
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
        'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
        'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
        'ñ': 'n', 'ç': 'c', 'ß': 'ss',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)

    # Replace non-alphanumeric with hyphens
    text = re.sub(r'[^a-z0-9]+', '-', text)

    # Remove leading/trailing hyphens and collapse multiple hyphens
    text = re.sub(r'-+', '-', text)
    text = text.strip('-')

    # Truncate to max length, but don't break mid-word
    if len(text) > max_len:
        text = text[:max_len]
        # Don't break mid-word - go back to last hyphen
        last_hyphen = text.rfind('-')
        if last_hyphen > 20:  # Only go back if we still have a reasonable length
            text = text[:last_hyphen]

    return text


def find_all_block_files():
    """Find all block-* image files under assets."""
    pattern = os.path.join(ASSETS_DIR, "**", "block-*")
    files = glob.glob(pattern, recursive=True)
    return sorted(files)


def find_all_content_files():
    """Find all md/mdx files under content."""
    md_files = glob.glob(os.path.join(CONTENT_DIR, "**", "*.md"), recursive=True)
    mdx_files = glob.glob(os.path.join(CONTENT_DIR, "**", "*.mdx"), recursive=True)
    return sorted(md_files + mdx_files)


def read_file(path):
    """Read file content with UTF-8 encoding."""
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def write_file(path, content):
    """Write file content with UTF-8 encoding."""
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


def extract_block_references(content_files):
    """
    Build a mapping: block_filename -> { 'en': alt_text, 'de': alt_text, 'pt': alt_text }
    Also track which content files reference each block file.
    """
    # block_filename -> { locale -> alt_text }
    alt_texts = {}
    # block_filename -> set of (filepath, old_ref) for updating
    references = {}

    for fpath in content_files:
        content = read_file(fpath)

        # Determine locale from path
        # e.g., src/content/projects/en/file.md -> en
        rel = os.path.relpath(fpath, CONTENT_DIR)
        parts = rel.replace('\\', '/').split('/')
        locale = parts[1] if len(parts) >= 3 else 'en'

        for match in BLOCK_REF_PATTERN.finditer(content):
            alt_text = match.group(1)
            full_ref = match.group(2)
            block_filename = match.group(3)

            if block_filename not in alt_texts:
                alt_texts[block_filename] = {}
            if block_filename not in references:
                references[block_filename] = set()

            alt_texts[block_filename][locale] = alt_text.strip()
            references[block_filename].add(fpath)

    return alt_texts, references


def choose_alt_text(alt_dict):
    """
    Choose best alt text: prefer EN, then DE, then PT.
    Returns the chosen alt text or None if all empty.
    """
    for locale in ['en', 'de', 'pt']:
        text = alt_dict.get(locale, '').strip()
        if text:
            return text
    return None


def main():
    print("=" * 80)
    print("RENAME BLOCK IMAGES TO HUMAN-READABLE NAMES")
    print("=" * 80)
    print()

    # Step 1: Find all block files
    block_files = find_all_block_files()
    print(f"Found {len(block_files)} block-* image files")

    # Step 2: Find all content files
    content_files = find_all_content_files()
    print(f"Found {len(content_files)} content files (md/mdx)")

    # Step 3: Extract references
    alt_texts, references = extract_block_references(content_files)
    print(f"Found references for {len(alt_texts)} unique block filenames")
    print()

    # Step 4: Build rename plan
    # Track used names per directory to handle collisions
    used_names = {}  # directory -> set of names
    rename_plan = []  # list of (old_path, new_path, block_filename, new_filename)
    skipped_no_alt = []
    skipped_no_ref = []

    for block_path in block_files:
        block_dir = os.path.dirname(block_path)
        block_filename = os.path.basename(block_path)
        _, ext = os.path.splitext(block_filename)

        # Check if we have a reference for this file
        if block_filename not in alt_texts:
            skipped_no_ref.append(block_filename)
            continue

        # Choose the best alt text
        alt_text = choose_alt_text(alt_texts[block_filename])

        if not alt_text:
            skipped_no_alt.append(block_filename)
            continue

        # Slugify the alt text
        slug = slugify(alt_text)

        if not slug:
            skipped_no_alt.append(block_filename)
            continue

        # Handle collisions within the same directory
        if block_dir not in used_names:
            # Initialize with existing non-block filenames in the directory
            existing = set()
            if os.path.isdir(block_dir):
                for f in os.listdir(block_dir):
                    if not f.startswith('block-'):
                        name_no_ext = os.path.splitext(f)[0]
                        existing.add(name_no_ext)
            used_names[block_dir] = existing

        final_slug = slug
        counter = 1
        while final_slug in used_names[block_dir]:
            final_slug = f"{slug}-{counter:02d}"
            counter += 1

        used_names[block_dir].add(final_slug)

        new_filename = final_slug + ext
        new_path = os.path.join(block_dir, new_filename)

        rename_plan.append((block_path, new_path, block_filename, new_filename))

    # Step 5: Print summary and execute
    print("RENAME PLAN")
    print("-" * 80)

    for old_path, new_path, old_name, new_name in rename_plan:
        # Show relative dir
        rel_dir = os.path.relpath(os.path.dirname(old_path), ASSETS_DIR)
        print(f"  {rel_dir}/")
        print(f"    {old_name}")
        print(f"    -> {new_name}")
        print()

    print(f"\nTotal renames: {len(rename_plan)}")
    print(f"Skipped (no reference in content): {len(skipped_no_ref)}")
    print(f"Skipped (empty alt text): {len(skipped_no_alt)}")

    if skipped_no_alt:
        print(f"\n  Empty alt text files:")
        for f in skipped_no_alt:
            print(f"    - {f}")

    if skipped_no_ref:
        print(f"\n  No reference found for:")
        for f in skipped_no_ref:
            print(f"    - {f}")

    # Step 6: Execute renames
    print("\n" + "=" * 80)
    print("EXECUTING RENAMES...")
    print("=" * 80)

    # First, rename the physical files
    renamed_count = 0
    for old_path, new_path, old_name, new_name in rename_plan:
        if os.path.exists(old_path):
            os.rename(old_path, new_path)
            renamed_count += 1
        else:
            print(f"  WARNING: File not found: {old_path}")

    print(f"  Renamed {renamed_count} files on disk")

    # Step 7: Update all content file references
    print("\n  Updating content file references...")
    updated_files = 0
    updated_refs = 0

    # Build a lookup: old_filename -> new_filename
    rename_lookup = {}
    for _, _, old_name, new_name in rename_plan:
        rename_lookup[old_name] = new_name

    for fpath in content_files:
        content = read_file(fpath)
        new_content = content

        for old_name, new_name in rename_lookup.items():
            if old_name in new_content:
                count = new_content.count(old_name)
                new_content = new_content.replace(old_name, new_name)
                updated_refs += count

        if new_content != content:
            write_file(fpath, new_content)
            updated_files += 1

    print(f"  Updated {updated_refs} references across {updated_files} content files")

    # Final summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"  Files renamed:          {renamed_count}")
    print(f"  Content files updated:  {updated_files}")
    print(f"  References updated:     {updated_refs}")
    print(f"  Skipped (no alt text):  {len(skipped_no_alt)}")
    print(f"  Skipped (no reference): {len(skipped_no_ref)}")


if __name__ == '__main__':
    main()
