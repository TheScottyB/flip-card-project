#\!/bin/bash

# Script to clean up files with problematic names
REPO_DIR="/Users/scottybe/Desktop/flip-card-project"

# Display the issue
echo "==== PROBLEMATIC FILES DETECTED ===="
echo "The following files have newline characters at the beginning of their names:"
ls -la "$REPO_DIR/"*$'\n'*

echo -e "\nThese files will cause issues with Git and GitHub Pages."
echo -e "Let's check if we need them or if they're duplicates of existing files.\n"

# Check if these are duplicates of the proper files
for PROBLEM_FILE in "$REPO_DIR/"*$'\n'*; do
  # Extract the real filename part (after the newline)
  FILENAME=$(basename "$PROBLEM_FILE" | tr '\n' '_' | sed 's/^_//')
  
  if [ -f "$REPO_DIR/$FILENAME" ]; then
    echo "File $FILENAME already exists properly - the problematic file is a duplicate"
    
    # Check if they're identical
    if cmp -s "$PROBLEM_FILE" "$REPO_DIR/$FILENAME"; then
      echo "✓ Content is identical - safe to remove the problematic file"
    else
      echo "\! Content differs - saving a copy to cleanup-tmp before removal"
      cp "$PROBLEM_FILE" "$REPO_DIR/cleanup-tmp/COPY-$FILENAME"
    fi
    
    # Remove the problematic file
    rm "$PROBLEM_FILE"
    echo "✓ Removed problematic file with newline in name"
    echo ""
  else
    echo "\! File $FILENAME doesn't exist properly - renaming the problematic file"
    mv "$PROBLEM_FILE" "$REPO_DIR/$FILENAME"
    echo "✓ Renamed problematic file to $FILENAME"
    echo ""
  fi
done

echo "Cleanup complete\! All files with problematic names have been handled."
