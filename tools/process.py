"""Build optimized site assets from originals + rembg cutouts. Run: python3 tools/process.py"""
import os, json
from PIL import Image, ImageFilter, ImageDraw, ImageChops
import numpy as np
Image.MAX_IMAGE_PIXELS=None
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
O=R+'/assets/originals/'; W=R+'/assets/work/'; D=R+'/assets/img/'
os.makedirs(D,exist_ok=True)
info={}
def orig(prefix):
    return O+[f for f in sorted(os.listdir(O)) if f.startswith(prefix+'_')][0]
def levels(a,lo,hi):
    x=(np.asarray(a).astype(np.float32)-lo)/(hi-lo); return Image.fromarray((np.clip(x,0,1)*255).astype(np.uint8))
def fill_holes(alpha):
    """close gaps + fill enclosed holes of a cutout mask (handles toe caps the model dropped)"""
    w,h=alpha.size; s=alpha.resize((w//4,h//4),Image.BILINEAR).point(lambda v:255 if v>100 else 0)
    s=s.filter(ImageFilter.MaxFilter(13)).filter(ImageFilter.MinFilter(13))
    pad=Image.new('L',(s.width+4,s.height+4),0); pad.paste(s,(2,2))
    ImageDraw.floodfill(pad,(0,0),128)
    filled=pad.point(lambda v:0 if v==128 else 255).crop((2,2,2+s.width,2+s.height))
    filled=filled.filter(ImageFilter.MinFilter(5)).resize((w,h),Image.BILINEAR).filter(ImageFilter.GaussianBlur(3))
    return ImageChops.lighter(alpha,levels(filled,90,170))
def crop_to(im,pad=24,thr=128):
    a=np.asarray(im)[...,3]; ys,xs=np.where(a>thr)
    return im.crop((max(xs.min()-pad,0),max(ys.min()-pad,0),min(xs.max()+pad,im.width),min(ys.max()+pad,im.height)))
def save(im,name,w,q=84):
    im=im.copy(); 
    if im.width>w: im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
    im.save(D+name,'WEBP',quality=q,method=6,alpha_quality=92)
    info[name]={'w':im.width,'h':im.height,'kb':round(os.path.getsize(D+name)/1024)}
    return im

# ---- 1. side profile: full shoe + "line" layer (tan trail, bindings, eyelets, embroidery)
im=Image.open(W+'m01_cut.png'); im.putalpha(levels(im.getchannel('A'),70,225)); im=crop_to(im)
rgb=np.asarray(im.convert('RGB')).astype(np.float32); a=np.asarray(im.getchannel('A')).astype(np.float32)/255
mx=rgb.max(2); mn=rgb.min(2); sat=(mx-mn)/np.maximum(mx,1)
# canvas colour: bright, low-ish saturation pixels
canvas=rgb[(a>.99)&(mx>205)&(sat>.15)&(sat<.32)]; info['canvas_rgb']=[int(v) for v in np.median(canvas,0)]
tanpx=rgb[(a>.99)&(sat>.5)&(mx>120)&(mx<190)]; info['trail_rgb']=[int(v) for v in np.median(tanpx,0)]
# line mask: dark OR strongly saturated (tan suede, eyelets, embroidery, stitch shadows)
t=np.clip((sat-.36)/.14,0,1)*np.clip((228-mx)/30,0,1)
t=np.maximum(t,np.clip((150-mx)/40,0,1))
tm=Image.fromarray((t*a*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
tm=levels(tm,40,200)
line=im.copy(); line.putalpha(tm)
save(im,'side-full.webp',1800); save(line,'side-line.webp',1800,q=86)

# ---- 2. heel pair -> left (गली) / right (LABS)
im=Image.open(W+'m05_cut.png'); im.putalpha(levels(im.getchannel('A'),70,225)); im=crop_to(im,pad=10)
al=np.asarray(im.getchannel('A')); col=(al>128).sum(0); mid=im.width//2
lo=mid-im.width//6; split=lo+int(np.argmin(col[lo:mid+im.width//6])); info['heel_gap_cols']=int(col[split])
L=im.crop((0,0,split,im.height)); Rr=im.crop((split,0,im.width,im.height))
info['heel_src']={'w':im.width,'h':im.height,'split':split}
for nm,part in (('heel-l.webp',L),('heel-r.webp',Rr)):
    a2=np.asarray(part)[...,3]; ys,xs=np.where(a2>128); info[nm+'_bbox']=[int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())]
    save(part,nm,round(900*part.width/im.width*2)//1,q=84)

# ---- 3. lace pair: cream (m04) + tan (m03), registered to each other
def prep(n):
    im=Image.open(W+n+'_cut.png'); a=fill_holes(levels(im.getchannel('A'),70,225)); im.putalpha(a); return crop_to(im,pad=0)
c=prep('m04'); tn=prep('m03'); tn=tn.resize(c.size,Image.LANCZOS)
info['lace_aspect']=[c.size, tn.size]
pad=30
def padim(i):
    o=Image.new('RGBA',(i.width+2*pad,i.height+2*pad),(0,0,0,0)); o.paste(i,(pad,pad)); return o
save(padim(c),'pair-cream.webp',1500); save(padim(tn),'pair-tan.webp',1500)

# ---- 4. detail + lifestyle photos (plain crops, no cutout)
def photo(prefix,name,w,box=None,q=80):
    im=Image.open(orig(prefix)).convert('RGB')
    if box: 
        W_,H_=im.size; im=im.crop((int(box[0]*W_),int(box[1]*H_),int(box[2]*W_),int(box[3]*H_)))
    if im.width>w: im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
    im.save(D+name,'WEBP',quality=q,method=6); info[name]={'w':im.width,'h':im.height,'kb':round(os.path.getsize(D+name)/1024)}
photo('m06','detail-toe.webp',1200)
photo('m07','detail-trail.webp',1200)
photo('m08','detail-tongue.webp',1200)
photo('m02','life-rug.webp',1300)
photo('m10','life-tie.webp',1300)
photo('m11','life-socks.webp',1300)
photo('w02','life-room.webp',1300)
photo('w08','life-hold.webp',1300)
photo('m09','box.webp',1100)
json.dump(info,open(R+'/assets/img/_info.json','w'),indent=1); print(json.dumps(info,indent=0))
