from PIL import Image
import os

input_path = r'c:\Users\Hp\Documents\Github\Tera\public\images\TERA_LOGO_ONLY.png'
output_path = r'c:\Users\Hp\Documents\Github\Tera\public\images\TERA_LOGO_ONLY1.png'

try:
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        # Check if the pixel is not fully transparent
        if item[3] > 0:
            # Change visible pixels to black, preserving alpha
            new_data.append((0, 0, 0, item[3]))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Successfully created {output_path}")
    
except Exception as e:
    print(f"Error: {e}")
