import sys
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
out=sys.argv[1]; files=sys.argv[2:]
n=len(files); cols=min(n,4 if n>3 else n); rows=(n+cols-1)//cols
cell=1200//cols
sh=Image.new('RGB',(cols*cell,rows*cell),(120,120,120))
for k,f in enumerate(files):
    im=Image.open(f)
    if im.mode in('RGBA','LA','P'):
        im=im.convert('RGBA'); bg=Image.new('RGBA',im.size,(200,60,160,255)); im=Image.alpha_composite(bg,im)
    im=im.convert('RGB'); im.thumbnail((cell-4,cell-4))
    sh.paste(im,((k%cols)*cell+2,(k//cols)*cell+2))
if max(sh.size)>1200: sh.thumbnail((1200,1200))
q=80
while True:
    sh.save(out,'JPEG',quality=q)
    import os
    if os.path.getsize(out)<240000 or q<30: break
    q-=8
print(out,sh.size,os.path.getsize(out))
