from reportlab.graphics import renderSVG
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing


TARGET = "https://zhengxujosh.github.io/faculty-lab-homepage/join/"
OUTPUT = "../assets/recruitment/xlab-join-qr.svg"

widget = qr.QrCodeWidget(TARGET)
bounds = widget.getBounds()
width = bounds[2] - bounds[0]
height = bounds[3] - bounds[1]
size = 360
quiet_zone = 18
usable = size - quiet_zone * 2

drawing = Drawing(size, size)
widget.barWidth = usable
widget.barHeight = usable
widget.x = quiet_zone
widget.y = quiet_zone
drawing.add(widget)
renderSVG.drawToFile(drawing, OUTPUT)
