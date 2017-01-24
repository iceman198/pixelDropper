"# pixelDropper" 

The build is half the fun. Start with the NeoPixel build I have on Hackaday.io (https://hackaday.io/project/16482-neopixel-data-visualization-board) or something similar.

This code will utilize the strips and such to give a 'connect-four' style drop.

The 'serverChild.js' rest services use the following format:

    http://123.123.123.123/pic
        Fires off the read of a JSON file to consume the colors.  See 'unicorn.json' as an example.
    http://123.123.123.123/dropper/10/#ffffff/
        In this case '10' is the strip to 'drop' the pixel and #ffffff is the color code.
        The color code can be rbg seperated by colons as well (12:255:10)

    http://123.123.123.123/pixel/200/#ffffff/
        This will light up a specific pixel number where '200' is the pixel number and #ffffff is the color code

