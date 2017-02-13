from PIL import Image, ImageDraw, ImageFont

fnt = ImageFont.truetype('C:\\Windows\\Fonts\\OpenSans-Semibold.ttf', 12)
msg = "UNTURNEDMAP.COM"
base = Image.open("0.jpg")
W,H = base.size

txt = Image.new('RGBA', base.size, (255,255,255,0))
draw = ImageDraw.Draw(txt)
w, h = draw.textsize(msg)
draw.text(((W-w)/2,(H-h)/2), msg, font=fnt, fill=(255,255,255,15))

out = Image.alpha_composite(base.convert("RGBA"), txt)
out.save("out.jpg")