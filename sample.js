

var lazyLoadData = [];
createLazyLoadData(10000);

// local binding
var grid1 = new ej.grids.Grid({
    dataSource: lazyLoadData,
    height: 300,
    allowPaging: true,
    // enableVirtualization: true,
    // pageSettings: {pageSize: 50},
    // enableInfiniteScrolling: true,
    rowHeight: 37,
    allowGrouping: true,
    allowSorting: true,
    allowFiltering: true,
    filterSettings: { type: 'Excel' },
    editSettings: { allowAdding: true, allowEditing: true, allowDeleting: true, mode: 'Normal' },
    toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'],
    groupSettings: { enableLazyLoading: true, columns: ['ProductName'] },
    searchSettings: { fields: ['OrderID', 'ProductName', 'ProductID', 'ProductID', 'CustomerName'] },
    columns: [
        { field: 'OrderID', headerText: 'Order ID', type: 'number', textAlign: 'Right', isPrimaryKey: true, width: 120 },
        { field: 'ProductName', headerText: 'Product Name', type: 'string', width: 160 },
        { field: 'ProductID', headerText: 'Product ID', type: 'number', textAlign: 'Right', width: 120 },
        { field: 'CustomerID', headerText: 'Customer ID', type: 'string', width: 120 },
        { field: 'CustomerName', headerText: 'Customer Name', type: 'string', width: 160 }
    ]
});
grid1.appendTo('#Grid1');

// custom binding
var grid2 = new ej.grids.Grid({
    height: 300,
    allowPaging: true,
    // enableVirtualization: true,
    // pageSettings: {pageSize: 50},
    // enableInfiniteScrolling: true,
    rowHeight: 37,
    allowGrouping: true,
    allowSorting: true,
    allowFiltering: true,
    filterSettings: { type: 'Excel' },
    editSettings: { allowAdding: true, allowEditing: true, allowDeleting: true, mode: 'Normal' },
    toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'],
    groupSettings: { enableLazyLoading: true, columns: ['ProductName'] },
    searchSettings: { fields: ['OrderID', 'ProductName', 'ProductID', 'ProductID', 'CustomerName'] },
    columns: [
        { field: 'OrderID', headerText: 'Order ID', type: 'number', textAlign: 'Right', isPrimaryKey: true, width: 120 },
        { field: 'ProductName', headerText: 'Product Name', type: 'string', width: 160 },
        { field: 'ProductID', headerText: 'Product ID', type: 'number', textAlign: 'Right', width: 120 },
        { field: 'CustomerID', headerText: 'Customer ID', type: 'string', width: 120 },
        { field: 'CustomerName', headerText: 'Customer Name', type: 'string', width: 160 }
    ],
    load: load,
    dataStateChange: dataStateChange,
    dataSourceChanged: dataSourceChanged,
    actionFailure: actionFailure,
});
grid2.appendTo('#Grid2');

function load() {
    var query = new ej.data.Query();
    if (this.groupSettings && this.groupSettings.columns.length) {
        for (var i = 0; i < this.groupSettings.columns.length; i++) {
            query.group(this.groupSettings.columns[i]);
        }
    }
    if (this.groupSettings.enableLazyLoading) {
        query.lazyLoad.push({ key: 'isLazyLoad', value: true });
    }
    if (this.allowPaging || this.enableVirtualization || this.enableInfiniteScrolling) {
        var pageIndex = 1;
        var pageSize = this.enableInfiniteScrolling ? this.pageSettings.pageSize * 3 : this.pageSettings.pageSize ? this.pageSettings.pageSize : 12;
        query.isCountRequired = true;
        query.page(pageIndex, pageSize);
    }
    grid2.dataSource = new ej.data.DataManager(lazyLoadData).executeLocal(query);
}

function dataStateChange(state) {
    if (state.action &&
        (state.action.requestType == 'filterchoicerequest' ||
            state.action.requestType == 'filtersearchbegin' ||
            state.action.requestType == 'stringfilterrequest')) {
        var query = new ej.data.Query();
        query.take(state.take);
        if (state.where && state.where.length) {
            query.where(state.where[0].field, state.where[0].operator, state.where[0].value, state.where[0].ignoreCase);
        }
        state.dataSource(new ej.data.DataManager(lazyLoadData).executeLocal(query));
    }
    else {
        var currentPageData = lazyLoadData;
        var query = new ej.data.Query();
        if (state.search) {
            query.search(state.search[0].key, state.search[0].fields, state.search[0].operator, state.search[0].ignoreCase);
        }
        if (state.where) {
            var gridqueries = grid2.getDataModule().generateQuery().queries;
            var wherequery;
            for (var i = 0; i < gridqueries.length; i++) {
                if (gridqueries[i].fn == 'onWhere') {
                    wherequery = gridqueries[i].e;
                }
            }
            query.where(wherequery);
        }
        if (state.sorted && state.sorted.length) {
            for (var i = 0; i < state.sorted.length; i++) {
                query.sortBy(state.sorted[i].name, state.sorted[i].direction);
            }
        }
        if (state.take > -1 && state.skip > -1) {
            var pageIndex = (state.skip / state.take) + 1;
            var pageSize = state.take;
            query.isCountRequired = true;
            query.page(pageIndex, pageSize);
        }
        if (state.group && state.group.length) {
            for (var i = 0; i < state.group.length; i++) {
                query.group(state.group[i]);
            }
        }
        if (state.isLazyLoad) {
            query.lazyLoad.push({ key: 'isLazyLoad', value: state.isLazyLoad });
        }
        if (state.isLazyLoad && state.onDemandGroupInfo) {
            query.lazyLoad.push({ key: 'onDemandGroupInfo', value: state.action.lazyLoadQuery });
            query.isCountRequired = true;
        }
        grid2.dataSource = new ej.data.DataManager(currentPageData).executeLocal(query);
    }
}
function actionFailure(args) {
    console.log(args);
}
function dataSourceChanged(state) {
    if (state.action === 'add') {
        lazyLoadData.unshift(state.data);
        state.endEdit();
    }
    if (state.action === 'edit') {
        for (var j = 0; j < lazyLoadData.length; j++) {
            if (lazyLoadData[j]['OrderID'] == state.data['OrderID']) {
                lazyLoadData[j] = state.data;
                break;
            }
        }
        state.endEdit();
    }
    if (state.requestType == 'delete') {
        for (var i = 0; i < state.data.length; i++) {
            for (var j = 0; j < lazyLoadData.length; j++) {
                if (lazyLoadData[j]['OrderID'] == state.data[i]['OrderID']) {
                    lazyLoadData.splice(j, 1);
                    break;
                }
            }
        }
        state.endEdit();
    }
}


var radiobutton = new ej.buttons.RadioButton({ label: 'Pagination', name: 'page', checked: true, change: radioChange });
radiobutton.appendTo('#radiobutton1');

radiobutton = new ej.buttons.RadioButton({ label: 'Virtual Scroll', name: 'page', change: radioChange });
radiobutton.appendTo('#radiobutton2');

radiobutton = new ej.buttons.RadioButton({ label: 'Infinite Scroll', name: 'page', change: radioChange });
radiobutton.appendTo('#radiobutton3');

// define the array of data
let filterTypes = ['FilterBar', 'Menu', 'Excel'];

// initialize DropDownList component
let dropDownListObject = new ej.dropdowns.DropDownList({
    //set the data to dataSource property
    dataSource: filterTypes,
    // set placeholder to DropDownList input element
    placeholder: "Select a Filter",
    value: 'Excel',
    width: 200,
    change: ddChange
});

function ddChange(args){
    grid1.filterSettings.type = args.value;
    grid2.filterSettings.type = args.value;
} 

// render initialized DropDownList
dropDownListObject.appendTo('#ddlelement');
function radioChange(args) {
    debugger;
    if (this.checked) {
        if (this.label === 'Virtual Scroll') {
            grid1.setProperties({
                allowPaging: false,
                enableInfiniteScrolling: false,
                enableVirtualization: true
            }, true);
            grid2.setProperties({
                allowPaging: false,
                enableInfiniteScrolling: false,
                enableVirtualization: true
            }, true);
        }
        else if (this.label === 'Infinite Scroll') {
            grid1.setProperties({
                allowPaging: false,
                enableInfiniteScrolling: true,
                enableVirtualization: false
            }, true);
            grid2.setProperties({
                allowPaging: false,
                enableInfiniteScrolling: true,
                enableVirtualization: false
            }, true);
        } else {
            grid1.setProperties({
                allowPaging: true,
                enableInfiniteScrolling: false,
                enableVirtualization: false
            }, true);
            grid2.setProperties({
                allowPaging: true,
                enableInfiniteScrolling: false,
                enableVirtualization: false
            }, true);
        }
        grid1.freezeRefresh();
        grid2.freezeRefresh();
    }
}
function createLazyLoadData(count) {
    if (lazyLoadData.length) {
        return;
    }
    var customerid = ['VINET', 'TOMSP', 'HANAR', 'VICTE', 'SUPRD', 'HANAR', 'CHOPS', 'RICSU', 'WELLI', 'HILAA',
        'ERNSH', 'CENTC', 'OTTIK', 'QUEDE', 'RATTC', 'ERNSH', 'FOLKO', 'BLONP', 'WARTH', 'FRANK', 'GROSR', 'WHITC', 'WARTH',
        'SPLIR', 'RATTC', 'QUICK', 'VINET', 'MAGAA', 'TORTU', 'MORGK', 'BERGS', 'LEHMS', 'BERGS', 'ROMEY', 'ROMEY', 'LILAS',
        'LEHMS', 'QUICK', 'QUICK', 'RICAR', 'REGGC', 'BSBEV', 'COMMI', 'QUEDE', 'TRADH', 'TORTU', 'RATTC', 'VINET', 'LILAS',
        'BLONP', 'HUNGO', 'RICAR', 'MAGAA', 'WANDK', 'SUPRD', 'GODOS', 'TORTU', 'OLDWO', 'ROMEY', 'LONEP', 'ANATR', 'HUNGO',
        'THEBI', 'DUMON', 'WANDK', 'QUICK', 'RATTC', 'ISLAT', 'RATTC', 'LONEP', 'ISLAT', 'TORTU', 'WARTH', 'ISLAT', 'PERIC',
        'KOENE', 'SAVEA', 'KOENE', 'BOLID', 'FOLKO', 'FURIB', 'SPLIR', 'LILAS', 'BONAP', 'MEREP', 'WARTH', 'VICTE',
        'HUNGO', 'PRINI', 'FRANK', 'OLDWO', 'MEREP', 'BONAP', 'SIMOB', 'FRANK', 'LEHMS', 'WHITC', 'QUICK', 'RATTC', 'FAMIA'];
    var product = ['Chai', 'Chang', 'Aniseed Syrup', 'Chef Anton\'s Cajun Seasoning', 'Chef Anton\'s Gumbo Mix',
        'Grandma\'s Boysenberry Spread', 'Uncle Bob\'s Organic Dried Pears', 'Northwoods Cranberry Sauce', 'Mishi Kobe Niku',
        'Ikura', 'Queso Cabrales', 'Queso Manchego La Pastora', 'Konbu', 'Tofu', 'Genen Shouyu', 'Pavlova', 'Alice Mutton',
        'Carnarvon Tigers', 'Teatime Chocolate Biscuits', 'Sir Rodney\'s Marmalade', 'Sir Rodney\'s Scones',
        'Gustaf\'s Knäckebröd', 'Tunnbröd', 'Guaraná Fantástica', 'NuNuCa Nuß-Nougat-Creme', 'Gumbär Gummibärchen',
        'Schoggi Schokolade', 'Rössle Sauerkraut', 'Thüringer Rostbratwurst', 'Nord-Ost Matjeshering', 'Gorgonzola Telino',
        'Mascarpone Fabioli', 'Geitost', 'Sasquatch Ale', 'Steeleye Stout', 'Inlagd Sill',
        'Gravad lax', 'Côte de Blaye', 'Chartreuse verte', 'Boston Crab Meat', 'Jack\'s New England Clam Chowder',
        'Singaporean Hokkien Fried Mee', 'Ipoh Coffee', 'Gula Malacca', 'Rogede sild', 'Spegesild', 'Zaanse koeken',
        'Chocolade', 'Maxilaku', 'Valkoinen suklaa', 'Manjimup Dried Apples', 'Filo Mix', 'Perth Pasties',
        'Tourtière', 'Pâté chinois', 'Gnocchi di nonna Alice', 'Ravioli Angelo', 'Escargots de Bourgogne',
        'Raclette Courdavault', 'Camembert Pierrot', 'Sirop d\'érable',
        'Tarte au sucre', 'Vegie-spread', 'Wimmers gute Semmelknödel', 'Louisiana Fiery Hot Pepper Sauce',
        'Louisiana Hot Spiced Okra', 'Laughing Lumberjack Lager', 'Scottish Longbreads',
        'Gudbrandsdalsost', 'Outback Lager', 'Flotemysost', 'Mozzarella di Giovanni', 'Röd Kaviar', 'Longlife Tofu',
        'Rhönbräu Klosterbier', 'Lakkalikööri', 'Original Frankfurter grüne Soße'];
    var customername = ['Maria', 'Ana Trujillo', 'Antonio Moreno', 'Thomas Hardy', 'Christina Berglund',
        'Hanna Moos', 'Frédérique Citeaux', 'Martín Sommer', 'Laurence Lebihan', 'Elizabeth Lincoln',
        'Victoria Ashworth', 'Patricio Simpson', 'Francisco Chang', 'Yang Wang', 'Pedro Afonso', 'Elizabeth Brown',
        'Sven Ottlieb', 'Janine Labrune', 'Ann Devon', 'Roland Mendel', 'Aria Cruz', 'Diego Roel',
        'Martine Rancé', 'Maria Larsson', 'Peter Franken', 'Carine Schmitt', 'Paolo Accorti', 'Lino Rodriguez',
        'Eduardo Saavedra', 'José Pedro Freyre', 'André Fonseca', 'Howard Snyder', 'Manuel Pereira',
        'Mario Pontes', 'Carlos Hernández', 'Yoshi Latimer', 'Patricia McKenna', 'Helen Bennett', 'Philip Cramer',
        'Daniel Tonini', 'Annette Roulet', 'Yoshi Tannamuri', 'John Steel', 'Renate Messner', 'Jaime Yorres',
        'Carlos González', 'Felipe Izquierdo', 'Fran Wilson', 'Giovanni Rovelli', 'Catherine Dewey', 'Jean Fresnière',
        'Alexander Feuer', 'Simon Crowther', 'Yvonne Moncada', 'Rene Phillips', 'Henriette Pfalzheim',
        'Marie Bertrand', 'Guillermo Fernández', 'Georg Pipps', 'Isabel de Castro', 'Bernardo Batista', 'Lúcia Carvalho',
        'Horst Kloss', 'Sergio Gutiérrez', 'Paula Wilson', 'Maurizio Moroni', 'Janete Limeira', 'Michael Holz',
        'Alejandra Camino', 'Jonas Bergulfsen', 'Jose Pavarotti', 'Hari Kumar', 'Jytte Petersen', 'Dominique Perrier',
        'Art Braunschweiger', 'Pascale Cartrain', 'Liz Nixon', 'Liu Wong', 'Karin Josephs', 'Miguel Angel Paolino',
        'Anabela Domingues', 'Helvetius Nagy', 'Palle Ibsen', 'Mary Saveley', 'Paul Henriot', 'Rita Müller',
        'Pirkko Koskitalo', 'Paula Parente', 'Karl Jablonski', 'Matti Karttunen', 'Zbyszek Piestrzeniewicz'];
    var customeraddress = ['507 - 20th Ave. E.\r\nApt. 2A', '908 W. Capital Way', '722 Moss Bay Blvd.',
        '4110 Old Redmond Rd.', '14 Garrett Hill', 'Coventry House\r\nMiner Rd.', 'Edgeham Hollow\r\nWinchester Way',
        '4726 - 11th Ave. N.E.', '7 Houndstooth Rd.', '59 rue de l\'Abbaye', 'Luisenstr. 48', '908 W. Capital Way',
        '722 Moss Bay Blvd.', '4110 Old Redmond Rd.', '14 Garrett Hill', 'Coventry House\r\nMiner Rd.',
        'Edgeham Hollow\r\nWinchester Way',
        '7 Houndstooth Rd.', '2817 Milton Dr.', 'Kirchgasse 6', 'Sierras de Granada 9993', 'Mehrheimerstr. 369',
        'Rua da Panificadora, 12', '2817 Milton Dr.', 'Mehrheimerstr. 369'];
    var quantityperunit = ['10 boxes x 20 bags', '24 - 12 oz bottles', '12 - 550 ml bottles',
        '48 - 6 oz jars', '36 boxes', '12 - 8 oz jars', '12 - 1 lb pkgs.', '12 - 12 oz jars',
        '18 - 500 g pkgs.', '12 - 200 ml jars',
        '1 kg pkg.', '10 - 500 g pkgs.', '2 kg box', '40 - 100 g pkgs.', '24 - 250 ml bottles', '32 - 500 g boxes',
        '20 - 1 kg tins', '16 kg pkg.', '10 boxes x 12 pieces', '30 gift boxes', '24 pkgs. x 4 pieces', '24 - 500 g pkgs.',
        '12 - 250 g pkgs.',
        '12 - 355 ml cans', '20 - 450 g glasses', '100 - 250 g bags'];
    var orderID = 10248;
    for (var i = 0; i < count; i++) {
        lazyLoadData.push({
            'OrderID': orderID + i,
            'CustomerID': customerid[Math.floor(Math.random() * customerid.length)],
            'CustomerName': customername[Math.floor(Math.random() * customername.length)],
            'CustomerAddress': customeraddress[Math.floor(Math.random() * customeraddress.length)],
            'ProductName': product[Math.floor(Math.random() * product.length)],
            'ProductID': i,
            'Quantity': quantityperunit[Math.floor(Math.random() * quantityperunit.length)]
        });
    }
}