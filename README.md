# 🎧 Audiobook Studio Pro

**Audiobook Studio Pro** သည် မြန်မာစာအုပ်များ၊ ဝတ္ထုရှည်များ၊ အသံထွက်စာအုပ်များအတွက် ပရော်ဖက်ရှင်နယ် အဆင့်မီ **1080p Full HD / 2K QHD ဗီဒီယို** များနှင့် **1080p YouTube Thumbnail** များကို အလွယ်တကူ ထုတ်လုပ်ပေးနိုင်သော Standalone Creator Tool ဖြစ်ပါသည်။

---

## ✨ Features (ပါဝင်သော စွမ်းဆောင်ရည်များ)

1. **Standalone Host Server (Port 1104):**
   - E-Quiz နှင့် သီးသန့် ခွဲထုတ်ထားပြီး `http://localhost:1104` တွင် အလုပ်လုပ်ပါသည်။
2. **One-Click Launchers (Mac & Windows):**
   - **macOS:** `Start_Audiobook_Studio.command` ကို Double-Click နှိပ်ရုံဖြင့် အလိုအလျောက် Browser ပွင့်ပြီး Run ပေးပါသည်။ ရပ်လိုပါက `Stop_Audiobook_Studio.command` ကို နှိပ်နိုင်ပါသည်။
   - **Windows:** `Start_Audiobook_Studio.bat` ကို Double-Click နှိပ်ရုံဖြင့် Run ပေးပါသည်။ ရပ်လိုပါက `Stop_Audiobook_Studio.bat` ကို နှိပ်နိုင်ပါသည်။
3. **1080p Ultra-Crisp Thumbnail Generator:**
   - YouTube High CTR Layout ပုံစံ (၆) မျိုး:
     - 📰 Classic Split
     - 📖 Poster Focus
     - ⚡ Dramatic Split
     - 🌟 Minimal Aura
     - 🎬 Cinematic Landscape
     - 🔥 **Action & Crime Thriller** (လူမိုက်၊ ရာဇဝတ်မှု၊ အက်ရှင်ဇာတ်လမ်းများအတွက် Crimson / Amber Dynamic Glow)
   - Thumbnail သီးသန့် Title, Subheader, Author, Episode အရွယ်အစားနှင့် စာလုံးအရောင်များကို Video နှင့် သီးခြားစီ Custom စိတ်ကြိုက်ပြင်ဆင်နိုင်ခြင်း။
4. **2-Line Main Header Support:**
   - ခေါင်းစဉ်ရှည်များအတွက် Enter ခေါက်ပြီး စာကြောင်း (၂) ကြောင်းအထိ ခွဲ၍ လှပစွာ ဖော်ပြနိုင်ခြင်း။
5. **Direct Video Export with Main Title Name:**
   - ထွက်လာသော ဗီဒီယိုများကို Header Title နာမည်အတိုင်း `~/Downloads/Audiobook/Audiobook/` ထဲတွင် အလိုအလျောက် သီးသန့်ခွဲ၍ သိမ်းဆည်းပေးခြင်း။
6. **Strict FIFO Sequential Render Queue:**
   - ဗီဒီယို Render လုပ်ရာတွင် တစ်ခုပြီးမှ နောက်တစ်ခု အစဉ်လိုက် တိကျစွာ လုပ်ဆောင်ပေးခြင်း။
7. **Gemini Multimodal 7m AI Cover Generator:**
   - အသံဖိုင်၏ ၇ မိနစ်စာ အကျဉ်းကို Gemini multimodal ဖြင့် နားထောင်ဆန်းစစ်ပြီး ဇာတ်လမ်းနှင့် အကိုက်ညီဆုံး Cover Art ပုံဖော်ပေးခြင်း။
8. **Automated 48-Hour Cleanup (1-Hour Interval):**
   - Temp ဖိုင်ဟောင်းများကို ၄၈ နာရီပြည့်တိုင်း ၁ နာရီတစ်ကြိမ် အလိုအလျောက် သန့်ရှင်းရေးလုပ်ပေးခြင်း။

---

## 🚀 How to Run (စတင်အသုံးပြုပုံ)

### 🍏 On macOS:
1. Terminal ဖွင့်စရာမလိုဘဲ `Start_Audiobook_Studio.command` ကို Double-Click နှိပ်ပါ။
2. Node.js dependencies များကို လိုအပ်ပါက အလိုအလျောက် ထည့်သွင်းပေးပြီး Browser တွင် `http://localhost:1104` ပွင့်လာပါမည်။
3. ပိတ်လိုပါက `Stop_Audiobook_Studio.command` ကို နှိပ်ပါ။

### 🪟 On Windows:
1. `Start_Audiobook_Studio.bat` ကို Double-Click နှိပ်ပါ။
2. အလိုအလျောက် dependencies များ စစ်ဆေး/install ပြုလုပ်ပြီး Browser တွင် `http://localhost:1104` ပွင့်လာပါမည်။
3. ပိတ်လိုပါက `Stop_Audiobook_Studio.bat` ကို နှိပ်ပါ။

---

## 🛠️ Prerequisites (လိုအပ်ချက်များ)
- **Node.js** (v18 or higher): [https://nodejs.org/](https://nodejs.org/)
- **FFmpeg**: Video / Audio muxing အတွက် လိုအပ်ပါသည်။
  - Mac: `brew install ffmpeg`
  - Windows: FFmpeg ကို PATH ထဲ ထည့်သွင်းထားရန် လိုအပ်ပါသည်။
- **yt-dlp**: YouTube အသံဖိုင်ဒေါင်းလုဒ်အတွက် လိုအပ်ပါသည်။
  - Mac: `brew install yt-dlp`
  - Windows: yt-dlp ကို PATH ထဲ ထည့်သွင်းထားရန် လိုအပ်ပါသည်။
