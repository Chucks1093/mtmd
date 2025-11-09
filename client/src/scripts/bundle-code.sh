#!/bin/bash

OUTPUT_FILE="llm.txt"

echo "🗜️  Creating ultra-compressed bundle (no spaces) for LLM..."

cat > "$OUTPUT_FILE" << EOF
===CODE-$(date +%Y%m%d)-$(basename "$(pwd)")===
EOF

file_count=0

# Only get the most essential files
git ls-files 2>/dev/null | grep -E "src/.*\.(ts|js)$" | head -15 | while read -r file; do
    [[ ! -f "$file" ]] && continue
    
    echo "Compressing: $file"
    echo "//$file" >> "$OUTPUT_FILE"
    
    # Extreme compression - remove ALL spaces and formatting
    cat "$file" | \
        sed 's|//.*$||g' | \
        sed '/console\./d' | \
        sed '/^[[:space:]]*$/d' | \
        sed 's/[[:space:]]*//g' | \
        tr -d '\n' >> "$OUTPUT_FILE"
    
    echo "" >> "$OUTPUT_FILE"
    ((file_count++))
done

echo "===$file_count-files===" >> "$OUTPUT_FILE"

actual_size=$(du -k "$OUTPUT_FILE" | cut -f1)
echo "✅ Ultra-mini bundle: $OUTPUT_FILE ($(du -h "$OUTPUT_FILE" | cut -f1))"
echo "🤖 Estimated tokens: ~$((actual_size * 4))"
echo "🗜️  Maximum compression applied!"