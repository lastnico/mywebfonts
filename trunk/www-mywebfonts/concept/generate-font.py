#!/usr/bin/python
# -*- coding: UTF-8 -*-

import sys
from PIL import Image, ImageFont, ImageDraw


class LetterImage():
    
    def __init__(self, letter, image):
        self.letter = letter
        self.image = image

    def getImage(self):
        return self.image

    def getLetter(self):
        return self.letter

class FontGenerator():
    
    def __init__(self, fontName, fontSize, fontColor):
        self.letters = "ABCDEFGHIJKLMNOPQRSTUVWYZabcdefghijklmnopqrstuvwxyz!?,;:/\\_()[]\"'&# "

        # Use a truetype font
        self.font = ImageFont.truetype(fontName, fontSize)
        self.fontColor = fontColor
        self.backgroundColor = (0,0,0,0)
        
        self.imageTemplate = None
        self.javascriptPositions = []
        self.letterImages = []
    

    def initializeLetterImages(self):
        
        for letter in self.letters:
            if letter == " ":
                currentImage = LetterImage(letter, self.createSpaceLetterImage())
            else:
                currentImage = LetterImage(letter, self.reduceLetter(letter))
                
            
            self.letterImages.append(currentImage)
        
    def initializeImageTemplateAndJavascript(self):
        imageSize = (0, 0)
        for letterImage in self.letterImages:
            imageSize = ( imageSize[0] + letterImage.getImage().size[0], letterImage.getImage().size[1])


        print "Template image size : %s" % repr(imageSize)
        
        self.imageTemplate = Image.new("RGBA", imageSize, "White")
        
        
        currentPositionX = 0
        for letterImage in self.letterImages:
            print "Pasting image..."
            self.imageTemplate.paste(letterImage.image, (currentPositionX, 0))
            draw = ImageDraw.Draw(self.imageTemplate)
            #draw.line( [ (currentPositionX+1, 0), (currentPositionX, imageSize[1]) ], fill="green" )
            
            if letterImage.getLetter() == 't':
                print "t : %s" % repr(letterImage.getImage().size)
            javascriptPosition = self.toJavascript(letterImage.getLetter(), currentPositionX, 0, letterImage.getImage().size[0], letterImage.getImage().size[1])
            self.javascriptPositions.append(javascriptPosition)
            
            currentPositionX = currentPositionX + letterImage.getImage().size[0]
                
    def initialize(self):
        self.initializeLetterImages()

        self.initializeImageTemplateAndJavascript()
        

    
    def getImageTemplate(self):
        return self.imageTemplate
    
    def getJavascriptDatas(self):
        return "{\n%s\n}\n" % ",\n".join(self.javascriptPositions)
    
    def toJavascript(self, letter, x, y, width, height):
        if letter == "'":
            letter = self.escape(letter)
        elif letter == "\\":
            letter = self.escape(letter)
        
        return "'%s' : { x: %d, y: %d, width: %d, height: %d }" % (letter, x, y, width, height)

    def escape(self, letter):
        return "\%s" % letter
    
    def createSpaceLetterImage(self):
        letter = u" "
        imageSize = self.font.getsize(letter)
    
        image = Image.new("RGBA", imageSize, self.backgroundColor)
        draw = ImageDraw.Draw(image)
        
        draw.text( (0, 0), letter, font=self.font, fill="Black")
        return image
    
    def createLetterImage(self, letter):
        letter = u" %s " % letter
        imageSize = self.font.getsize(letter)
    
        image = Image.new("RGBA", imageSize, self.backgroundColor)
        draw = ImageDraw.Draw(image)
        
        draw.text( (0, 0), letter, font=self.font, fill="Black")
        return image
    
    def reduceLetter(self, letter):
        image = self.createLetterImage(letter)
        
        minX = image.size[0]
        maxX = 0
        
        x, y = 0, 0
        datas = image.getdata()
        for pixel in datas:
            #print "(%d, %d) : %s" % (x, y, pixel)
            
            if pixel != self.backgroundColor:
                if x < minX:
                    minX = x
                    
                if x > maxX:
                    maxX = x
            
            x = x + 1
            if x == image.size[0]:
                x, y = 0, y +1
        
        print "Min : %s" % str(minX)
        print "Max : %s" % str(maxX)
        
        image = image.crop( (minX, 0, maxX+1, image.size[1]) )
        
        return image


def generate_once_width(letter):
    fontName = "/var/lib/defoma/gs.d/dirs/fonts/Loma.ttf"
    
    fontGenerator = FontGenerator(fontName, 25, "Black")
    image = fontGenerator.createLetterImage(letter)
    
    image.save("font-once.png", "PNG")

def generate_once_reduced(letter):
    fontName = "/var/lib/defoma/gs.d/dirs/fonts/Loma.ttf"
    
    fontGenerator = FontGenerator(fontName, 25, "Black")
    image = fontGenerator.reduceLetter(letter)
    
    image.save("font-once.png", "PNG")
    

def main():
    # "/usr/share/fonts/truetype/msttcorefonts/arial.ttf"
    #fontName = "/home/nicolas/workspace/xslfast/fonts/Bitstream-Vera-Sans.ttf"
    #fontName = "/var/lib/defoma/gs.d/dirs/fonts/DejaVuSerifCondensed-Bold.ttf"
    fontName = "/var/lib/defoma/gs.d/dirs/fonts/Loma.ttf"
    
    fontGenerator = FontGenerator(fontName, 25, "Black")
    
    fontGenerator.initialize()
    
    image = fontGenerator.getImageTemplate()
    javascriptDatas = fontGenerator.getJavascriptDatas()
    
    file = open("javascriptDatas.js","w")
    file.write("launchLetterReplacement(\n")
    file.write(javascriptDatas)
    file.write(");")
    file.close()

    print javascriptDatas
    
    image.save("font-example.png", "PNG")


if __name__ == "__main__":
    if len(sys.argv) == 1:
        main()
    else:
        #generate_once_width(sys.argv[1])
        generate_once_reduced(sys.argv[1])
    
