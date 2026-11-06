from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from reportlab.graphics.barcode import qr


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "recruitment"
W, H = 1080, 1350

IVORY = (243, 237, 225)
PAPER = (248, 244, 235, 238)
INK = (23, 26, 22)
MUTED = (101, 106, 99)
COBALT = (68, 92, 200)
CORAL = (221, 120, 95)
RULE = (190, 188, 179)

ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
ZH_SANS = "/System/Library/Fonts/Hiragino Sans GB.ttc"


def font(size, bold=False, zh=False):
    path = ZH_SANS if zh else (ARIAL_BOLD if bold else ARIAL)
    return ImageFont.truetype(path, size=size)


def cover(image, size):
    scale = max(size[0] / image.width, size[1] / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - size[0]) // 2
    top = (resized.height - size[1]) // 2
    return resized.crop((left, top, left + size[0], top + size[1]))


def alpha_at(y):
    points = [(0, 8), (370, 22), (520, 145), (770, 230), (1350, 248)]
    for (y0, a0), (y1, a1) in zip(points, points[1:]):
        if y <= y1:
            t = (y - y0) / (y1 - y0)
            return round(a0 + (a1 - a0) * t)
    return points[-1][1]


def add_wash(canvas):
    wash = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pixels = wash.load()
    for y in range(H):
        base = alpha_at(y)
        for x in range(W):
            left_boost = round(20 * (1 - x / W))
            pixels[x, y] = (*IVORY, min(255, base + left_boost))
    canvas.alpha_composite(wash)


def tracked(draw, xy, text, text_font, fill, tracking=2):
    x, y = xy
    for char in text:
        draw.text((x, y), char, font=text_font, fill=fill, anchor="lt")
        width = draw.textlength(char, font=text_font)
        x += width + tracking


def line(draw, xy, text, text_font, fill=INK, anchor="lt", stroke_width=0):
    draw.text(xy, text, font=text_font, fill=fill, anchor=anchor, stroke_width=stroke_width, stroke_fill=fill)


def text_lines(draw, x, y, lines, text_font, fill=INK, leading=None, stroke_width=0):
    leading = leading or round(text_font.size * 1.18)
    for index, text in enumerate(lines):
        line(draw, (x, y + index * leading), text, text_font, fill, stroke_width=stroke_width)


def qr_image(target, box=118):
    widget = qr.QrCodeWidget(target)
    widget.qr.make()
    matrix = widget.qr.modules
    modules = len(matrix)
    quiet = 4
    unit = max(1, box // (modules + quiet * 2))
    actual = (modules + quiet * 2) * unit
    image = Image.new("RGB", (actual, actual), IVORY)
    draw = ImageDraw.Draw(image)
    for row, values in enumerate(matrix):
        for col, value in enumerate(values):
            if value:
                x0 = (col + quiet) * unit
                y0 = (row + quiet) * unit
                draw.rectangle((x0, y0, x0 + unit - 1, y0 + unit - 1), fill=INK)
    return image.resize((box, box), Image.Resampling.NEAREST)


def paste_black_logo(canvas):
    logo = Image.open(ROOT / "assets" / "team" / "gbu-logo.png").convert("RGBA")
    target_w = 190
    logo = logo.resize((target_w, round(logo.height * target_w / logo.width)), Image.Resampling.LANCZOS)
    alpha = logo.getchannel("A")
    black = Image.new("RGBA", logo.size, (*INK, 0))
    black.putalpha(alpha.point(lambda value: round(value * 0.9)))
    canvas.alpha_composite(black, (W - 56 - target_w, 50))


def card(draw, rect, fill=PAPER, outline=RULE, width=1):
    draw.rounded_rectangle(rect, radius=0, fill=fill, outline=outline, width=width)


def render(lang):
    zh = lang == "zh"
    canvas = cover(Image.open(OUT / "xlab-recruitment-art-v1.png").convert("RGBA"), (W, H))
    add_wash(canvas)
    draw = ImageDraw.Draw(canvas, "RGBA")
    paste_black_logo(canvas)

    regular = lambda size: font(size, zh=zh)
    bold = lambda size: font(size, bold=True, zh=zh)

    # Header and hero
    tracked(draw, (56, 52), "X  LAB", font(31), INK, 4)
    draw.rectangle((56, 131, 94, 134), fill=CORAL)
    eyebrow = "多模态与情境智能" if zh else "MULTIMODAL AND SITUATIONAL INTELLIGENCE"
    tracked(draw, (106, 124), eyebrow, bold(14), MUTED, 2 if not zh else 3)

    if zh:
        text_lines(draw, 56, 157, ["X实验室", "诚聘英才"], bold(67), INK, 70, stroke_width=1)
        text_lines(draw, 56, 319, ["共同构建能够感知、理解、推理并生成物理世界内容的", "新一代人工智能系统。"], bold(21), INK, 31)
        line(draw, (56, 395), "郑旭 · 大湾区大学信息科学技术学院助理教授", bold(13), MUTED)
    else:
        text_lines(draw, 56, 151, ["WE ARE", "RECRUITING"], bold(73), INK, 65)
        text_lines(draw, 56, 306, ["Build AI systems that perceive, reason, interact, and generate", "in the physical world."], regular(23), INK, 30)
        line(draw, (56, 374), "Xu Zheng · Assistant Professor · SCIT, Great Bay University", bold(14), MUTED)

    # Main information cards
    research_box = (56, 432, 469, 776)
    roles_box = (487, 432, 1024, 776)
    card(draw, research_box)
    card(draw, roles_box)
    draw.rectangle((56, 432, 469, 436), fill=CORAL)
    draw.rectangle((487, 432, 1024, 436), fill=COBALT)

    section_font = bold(14)
    section_tracking = 2 if not zh else 3
    tracked(draw, (82, 463), "01 / 主要研究方向" if zh else "01 / RESEARCH DIRECTIONS", section_font, MUTED, section_tracking)
    tracked(draw, (513, 463), "02 / 招聘岗位" if zh else "02 / OPEN POSITIONS", section_font, MUTED, section_tracking)

    research = (
        ["多模态基础模型", "机器人与世界动作模型", "视频生成与数字人", "具身智能与物理智能"]
        if zh
        else [
            "Multimodal Foundation Models",
            "Robotics & World Action Models",
            "Video Generation & Digital Humans",
            "Embodied & Physical Intelligence",
        ]
    )
    item_font = bold(20 if not zh else 19)
    for y, item in zip((510, 571, 632, 693), research):
        draw.ellipse((82, y + 8, 90, y + 16), fill=CORAL)
        line(draw, (104, y), item, item_font)

    roles = (
        [
            ("博士后研究人员", "开放申请 · 按湾大正式聘用流程"),
            ("研究助理（RA）", "开放申请 · 邮件联系"),
            ("访问学生", "开放申请 · 远程或线下"),
            ("意向博士研究生", "先沟通方向 · 以官方联培项目为准"),
            ("意向硕士研究生", "先沟通方向 · 以官方联培项目为准"),
        ]
        if zh
        else [
            ("Postdoctoral Researchers", "Open · Formal GBU appointment"),
            ("Research Assistants", "Open · Apply by email"),
            ("Visiting Students", "Open · Remote or on-site"),
            ("Prospective PhD Students", "Research fit · Official joint programmes"),
            ("Prospective Master’s Students", "Research fit · Official joint programmes"),
        ]
    )
    role_title = bold(17 if not zh else 17)
    role_detail = bold(13 if not zh else 12)
    for index, (title, detail) in enumerate(roles):
        y = 497 + index * 59
        line(draw, (513, y), title, role_title)
        line(draw, (513, y + 23), detail, role_detail, MUTED)
        if index < len(roles) - 1:
            draw.line((513, y + 47, 998, y + 47), fill=(210, 207, 198), width=1)

    # Benefit cards
    offer_box = (56, 795, 1024, 931)
    card(draw, offer_box, fill=(248, 244, 235, 230))
    tracked(draw, (82, 819), "03 / 我们能够提供" if zh else "03 / WHAT WE OFFER", section_font, MUTED, section_tracking)
    benefits = (
        [["充足的", "计算资源"], ["前沿AI工具", "使用支持"], ["紧密的", "学术指导"], ["国际学术与", "产业合作"], ["高效开放的", "科研环境"]]
        if zh
        else [
            ["Strong computing", "resources"],
            ["Generous access to AI", "tools"],
            ["Close academic", "mentoring"],
            ["Global & industry", "collaboration"],
            ["Research freedom &", "efficient culture"],
        ]
    )
    card_w, gap, start_x = 175, 10, 82
    benefit_font = bold(13 if not zh else 13)
    for index, lines_value in enumerate(benefits):
        x = start_x + index * (card_w + gap)
        draw.rectangle((x, 849, x + card_w, 914), fill=(255, 255, 255, 80), outline=(195, 192, 184), width=1)
        line(draw, (x + 10, 856), f"0{index + 1}", bold(9), MUTED)
        draw.ellipse((x + card_w - 17, 858, x + card_w - 10, 865), fill=COBALT)
        text_lines(draw, x + 10, 876, lines_value, benefit_font, INK, 15)

    # Application panel
    draw.rectangle((56, 951, 1024, 1229), fill=INK)
    tracked(draw, (86, 978), "04 / 申请方式 · 滚动审核" if zh else "04 / HOW TO APPLY · ROLLING REVIEW", section_font, (170, 171, 163), section_tracking)
    line(draw, (86, 1011), "加入 X Lab" if zh else "Join X Lab.", bold(38), IVORY)
    line(draw, (86, 1059), "zhengx@gbu.edu.cn", bold(24), IVORY)
    draw.rectangle((86, 1087, 365, 1089), fill=CORAL)
    subject = "邮件主题：【X Lab申请】申请岗位－姓名" if zh else "Subject: [X Lab Application] Position – Your Name"
    line(draw, (86, 1103), subject, bold(14), IVORY)
    detail_lines = (
        ["请附申请岗位、预计开始时间、个人简历、研究兴趣，以及代表性论文、", "项目或代码仓库（如有）。"]
        if zh
        else [
            "Please include your position, expected start date, CV, research interests, and representative papers,",
            "projects, or code (if available).",
        ]
    )
    text_lines(draw, 86, 1130, detail_lines, regular(14), (177, 177, 169), 20)

    qr_shell = (842, 1013, 978, 1149)
    draw.rectangle(qr_shell, fill=IVORY)
    qr_code = qr_image("https://zhengxujosh.github.io/faculty-lab-homepage/join/", 118)
    canvas.paste(qr_code, (851, 1022))
    qr_label = "扫码了解详情" if zh else "SCAN FOR DETAILS"
    tracked(draw, (855 if zh else 857, 1162), qr_label, bold(10), IVORY, 2)

    # Footer and admission note
    footer = "大湾区大学 · 信息科学技术学院 · 中国东莞" if zh else "School of Computing and Information Technology · Great Bay University · Dongguan, China"
    line(draw, (56, 1271), footer, bold(11), MUTED)
    draw.rectangle((904, 1260, 1024, 1286), fill=(255, 255, 255, 55), outline=RULE, width=1)
    tracked(draw, (929, 1266), "X LAB", bold(10), INK, 2)
    draw.line((56, 1298, 1024, 1298), fill=RULE, width=1)
    disclaimer = (
        "博士和硕士机会通过适用的联合培养项目开展，具体招生与录取须遵循大湾区大学及合作高校的官方政策与要求。"
        if zh
        else "Graduate opportunities are pursued through applicable joint-training programmes and remain subject to the official admission requirements of Great Bay University and its partner universities."
    )
    line(draw, (56, 1310), disclaimer, regular(10 if not zh else 10), MUTED)

    output = OUT / f"xlab-recruitment-poster-{lang}-v2.png"
    canvas.convert("RGB").save(output, quality=96, optimize=True)
    return output


if __name__ == "__main__":
    for language in ("en", "zh"):
        print(render(language))
