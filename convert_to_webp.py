#!/usr/bin/env python3
"""
Convert PNG images to WebP format while preserving transparency.
This script converts banner-img.png to WebP format with alpha channel support.
"""

from PIL import Image
import os

def convert_png_to_webp_with_transparency(input_path, output_path, quality=90):
    """
    Convert PNG to WebP while preserving transparency.
    
    Args:
        input_path (str): Path to input PNG file
        output_path (str): Path to output WebP file
        quality (int): WebP quality (0-100, default 90)
    """
    try:
        # Open the PNG image
        with Image.open(input_path) as img:
            print(f"Original image mode: {img.mode}")
            print(f"Original image size: {img.size}")
            
            # Ensure the image has an alpha channel for transparency
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
                print("Converted to RGBA mode to preserve transparency")
            
            # Save as WebP with transparency support
            img.save(
                output_path, 
                'WebP', 
                quality=quality,
                lossless=False,  # Set to True for lossless compression
                method=6,        # Compression method (0-6, 6 is slowest but best)
                save_all=True   # Preserve all frames if animated
            )
            
            print(f"Successfully converted {input_path} to {output_path}")
            print(f"WebP quality: {quality}")
            
            # Verify the output
            with Image.open(output_path) as webp_img:
                print(f"Output image mode: {webp_img.mode}")
                print(f"Output image size: {webp_img.size}")
                
    except Exception as e:
        print(f"Error converting {input_path}: {e}")

def main():
    # Define paths
    input_file = "client/src/assets/banner-img.png"
    output_file = "client/src/assets/banner-img.webp"
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: Input file {input_file} not found!")
        return
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    print("Converting banner-img.png to WebP with transparency...")
    convert_png_to_webp_with_transparency(input_file, output_file, quality=90)
    
    # Show file sizes for comparison
    if os.path.exists(output_file):
        input_size = os.path.getsize(input_file)
        output_size = os.path.getsize(output_file)
        compression_ratio = (1 - output_size / input_size) * 100
        
        print(f"\nFile size comparison:")
        print(f"Original PNG: {input_size:,} bytes")
        print(f"WebP output: {output_size:,} bytes")
        print(f"Compression: {compression_ratio:.1f}% smaller")

if __name__ == "__main__":
    main()