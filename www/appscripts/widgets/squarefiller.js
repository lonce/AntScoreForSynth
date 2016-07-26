define(
    [],
    function () {

        return function (id, rowLength, colLength, objSize){

            //getting the
            var canvas = document.getElementById(id);
            var rect = canvas.getBoundingClientRect();
            var pWidth = rect.width;
            var pHeight = rect.height;
            console.log("pWidth is " + pWidth + ", and pHeight is " + pHeight);

            //scaling factor for rows and columns.
            var xLen = pWidth/colLength, yLen = pHeight/rowLength;

            // //2d grid
            var grid = [];

            //creates a cell in the 2D grid as an SVG rectangle.
            //x,y, - positions, side - of the square
            function createCell(x,y,s){

                var cell = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                // Set any attributes as desired
                cell.setAttribute("x", x*xLen);
                cell.setAttribute("y", y*yLen);
                cell.setAttribute("width",  s);
                cell.setAttribute("height",  s);
                cell.setAttribute("fill", "black");
                // Add to a parent node; document.documentElement should be the root svg element.
                document.getElementById("mySVG").appendChild(cell);

                cell.type = "link"; //string
                cell.state = 2; //number
                //cell.attr({"fill": "grey"});

                //function to update sate of the cell
                cell.updateState = null;

                //function to update color of the cell based on state
                cell.changeColor = function(){
                    if(this.state == 2){
                        this.setAttribute("fill", "grey");
                    }
                    else if(this.state == 1){
                        this.setAttribute("fill", "black");
                    }
                    else{
                        this.setAttribute("fill", "white");
                    }
                }

                return cell;
            }

            //simply populate the grid with the objects
            var row = 0,col=0;
            for(row = 0; row < rowLength; row++){
                grid[row] = [];
                for(col=0; col< colLength; col++){
                    grid[row][col] = new createCell(col,row,objSize);
                }
            }
            return grid;
        }

    });
    