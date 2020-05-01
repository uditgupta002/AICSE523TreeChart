


    var submitButton = document.getElementById("submit");
    submitButton.onclick = function(event) {

        var fileName = document.getElementById("file_name").value;
        if(fileName == null || fileName === '' || fileName.length === 0) {
            window.alert('Please enter a valid filename');
            return;
        }
        renderChart(fileName);
    };


function renderChart(file_name) {
    //Load External Data
    nodes_data = [];
    nodes2_data = [];

    var contentContainer = document.getElementById("content_div");
    contentContainer.innerHTML = "";

    var dropDown = document.createElement("div");
    dropDown.setAttribute("id","dropdown-div");
    contentContainer.appendChild(dropDown);

    var treeContainer = document.createElement("div");
    treeContainer.setAttribute("id","tree-container");
    treeContainer.setAttribute("class", "tree-container");
    //treeContainer.setAttribute("height","2000px");
    //treeContainer.setAttribute("width", "3000px");
    contentContainer.appendChild(treeContainer);

    d3.csv("data/" + file_name, function(error, data) {

        if(error) {
            window.alert("Please enter a valid filename : " + file_name);
            return;
        }

        data.forEach(function(d) {
            var obj = {
                //"index" : "d.index",
                "author" : d.Author,
                "DateTimeStamp" : d.DateTimeStamp,
                "Body" : d.Body,
                "innerHTML" : generateHTML(d),
                "Thread" : d.Thread,
                "PostsinThread" : d.PostsInThread,
                //"psuedoId" : d.psuedoId,
                "id" : d.ID
            };
            if(d.parentId != null && d.parentId !== '') {
                obj["parentId"] = d.parentId;
            } else {
                obj["parentId"] = "Root";
            }
            nodes_data.push(obj);
        });
        nodes_data.push({id: "Root", "innerHTML" : "Root"});

        //Stratifying data
        var stratified_data = d3.stratify()(nodes_data);
        recursiveTreant(stratified_data);

        //Fetch all the second level roots from main root
        var second_level_roots = stratified_data.children;


        //UI Manipulation

        var selectContainer = document.getElementById("dropdown-div");
        var select = document.createElement( 'select' );
        var option;

        //Adding Main Root
        //option = document.createElement( 'option' );
        //option.value = option.textContent = "All Threads";
        //select.appendChild(option);

        var groupedList = {};

        //Adding Second Level Roots
        second_level_roots.forEach(function(item) {
            //Perform grouping on second level roots

            if(item.data.Thread in groupedList) {
                var rootList = groupedList[item.data.Thread];
                rootList['children'].push(item);
            } else {
                groupedList[item.data.Thread] = {};
                groupedList[item.data.Thread]['children'] = [];
                groupedList[item.data.Thread]['children'].push(item);
            }
        });

        for (var key of Object.keys(groupedList)) {

            var total_branch_count = 0;
            var maxDepth = 0;
            groupedList[key].children.forEach(function(child) {
                total_branch_count += child.branch_count;
                maxDepth = Math.max(maxDepth, child.height);
            });

            groupedList[key]['innerHTML'] = groupedList[key].children[0].data.Thread
                + "</br>" + "First Post ID : "
                + groupedList[key].children[0].data.id
                + "</br>"
                + "Total Branches : "
                + total_branch_count
                + "</br>"
                + "Max Depth : "
                +  maxDepth;

            option = document.createElement( 'option' );
            option.value = option.textContent = key;
            select.appendChild(option);
        }

        //Adding drop down to dom
        selectContainer.appendChild(select);

        var treeContainer = document.getElementById("tree-container");

        //Add onChangeEvent to selectBox
        select.onchange = function(event) {
            treeContainer.innerHTML = "";
            generateChart("#tree-container", groupedList[this.options[this.selectedIndex].value]);
        }

        //Initialize with first item
        generateChart("#tree-container", groupedList[select.options[select.selectedIndex].value]);

    });

    function generateHTML(d) {
        var innerHTML = "<p class=\"comment\"><b>" + d.Author + "</b> : " + d.Body + "</br>" + "ID : " +d.ID + "</p>";
        return innerHTML;
    }

    function generateChart(container_id, nodes) {
        //Treant JS Code
        simple_chart_config = {
            chart: {
                container: container_id,
                levelSeparation:    30,
                siblingSeparation:  60,
                nodeAlign: "BOTTOM",
                connectors: {
                    type: "step",
                    style: {
                        "stroke-width": 2,
                        "stroke": "#000",
                        "stroke-dasharray": "--",
                        "arrow-end": "classic-wide-long"
                    }
                }
            },
            nodeStructure: nodes
        };
        var chart = new Treant(simple_chart_config, function() { }, $ );
        var treeContainer = document.getElementById("tree-container");
        treeContainer.scrollBy(chart.tree._R.width / 1000,0);
    }

    function recursiveTreant(root) {
        if(root == null) {
            return 1;
        }
        root.innerHTML = root.data.innerHTML;
        var branchCount = 0;
        if(root.children != null) {
            root.children.forEach(function (element) {
                branchCount += recursiveTreant(element);
            });
        } else
            branchCount = 1;
        root.branch_count = branchCount;
        return branchCount
    }
}

