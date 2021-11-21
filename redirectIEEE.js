var el = document.getElementsByTagName("iframe");

if (el.length > 0)
{
    for (var i = 0; i < el.length; i++) {
        if ("src" in el[i] && el[i].src.includes("ieeexplore.ieee.org"))
        {
            console.log(`Opening: ${el[i].src}`);
            window.open(el[i].src);
        }
    }
}
