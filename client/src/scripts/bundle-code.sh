#!/bin/bash

OUTPUT_FILE="llm.txt"

echo "🗜️  Creating ultra-compressed bundle (ZERO spaces) for React project..."

cat > "$OUTPUT_FILE" << EOF
===CODE-$(date +%Y%m%d)-$(basename "$(pwd)")===
EOF

file_count=0

# Target your actual folder structure from the image
echo "🔍 Searching for files in src/ folders..."

# Get files from the specific folders in your project
find ./src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    2>/dev/null | head -30 | while read -r file; do
    
    [[ ! -f "$file" ]] && continue
    
    echo "Compressing: $file"
    echo "//$file" >> "$OUTPUT_FILE"
    
    # ULTRA compression - remove EVERYTHING: spaces, tabs, newlines, comments
    cat "$file" | \
        sed 's|//.*$||g' | \
        sed 's|/\*.*\*/||g' | \
        sed 's|^\s*||g' | \
        sed 's|\s*$||g' | \
        sed '/^$/d' | \
        tr -d ' \t\n\r' >> "$OUTPUT_FILE"
    
    echo "" >> "$OUTPUT_FILE"
    ((file_count++))
done

# Also get the middleware.ts file specifically
if [[ -f "./src/middleware.ts" ]]; then
    echo "Compressing: ./src/middleware.ts"
    echo "//./src/middleware.ts" >> "$OUTPUT_FILE"
    cat "./src/middleware.ts" | \
        sed 's|//.*$||g' | \
        sed 's|/\*.*\*/||g' | \
        tr -d ' \t\n\r' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    ((file_count++))
fi

echo "===$file_count-files===" >> "$OUTPUT_FILE"

actual_size=$(du -k "$OUTPUT_FILE" 2>/dev/null | cut -f1)
file_size=$(du -h "$OUTPUT_FILE" 2>/dev/null | cut -f1)

echo "✅ Ultra-compressed bundle: $OUTPUT_FILE ($file_size)"
echo "🤖 Estimated tokens: ~$((actual_size * 4))"
echo "🗜️  ZERO SPACES - Maximum compression!"
echo "📊 Files processed: $file_count"

# Show what was found
echo ""
echo "📋 Files processed:"
find ./src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null | head -30