var map_coordinates =[]	
var table_results =  $('#table-results').DataTable({"bPaginate": false,
"aaSorting": [],
columnDefs: [{
    "defaultContent": "-",
    "targets": "_all",
	
}]}
);
var jsonlist = {}
function readFile(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function(e) {
      var htmlPreview =
        '<img width="200" src="' + e.target.result + '" />' +
        '<p>' + input.files[0].name + '</p>';
      var wrapperZone = $(input).parent();
      var previewZone = $(input).parent().parent().find('.preview-zone');
      var boxZone = $(input).parent().parent().find('.preview-zone').find('.box').find('.box-body');

      wrapperZone.removeClass('dragover');
      previewZone.removeClass('hidden');
      boxZone.empty();
      boxZone.append(htmlPreview);
    };

    reader.readAsDataURL(input.files[0]);
  }
}

function reset(e) {
  e.wrap('<form>').closest('form').get(0).reset();
  e.unwrap();
}

function _(el) {
  return document.getElementById(el);
}

$(".dropzone").on('change',function() {
  var file = _("pdf_file").files[0];
  var formdata = new FormData();
  formdata.append("pdf_file", file);
  formdata.append('csrfmiddlewaretoken',$('input[name="csrfmiddlewaretoken"]').prop('value'))
  var ajax = new XMLHttpRequest();
  ajax.upload.addEventListener("progress", progressHandler, false);
  ajax.addEventListener("load", completeHandler, false);
  ajax.addEventListener("error", errorHandler, false);
  ajax.addEventListener("abort", abortHandler, false);
  ajax.open("POST", "file_upload_parser"); // http://www.developphp.com/video/JavaScript/File-Upload-Progress-Bar-Meter-Tutorial-Ajax-PHP
  //use file_upload_parser.php from above url
  ajax.send(formdata);
});


function progressHandler(event) {
  //_("loaded_n_total").innerHTML = "Uploaded " + event.loaded + " bytes of " + event.total;
  
  	
  var percent = (event.loaded / event.total) * 100;
  _("progressBar").value = Math.round(percent);
  _("status").innerHTML = Math.round(percent) + "% uploaded... please wait";
  $('#loader').removeClass('d-none')
  $('.result').removeClass('d-none')
	
}

function completeHandler(event) {
	 
	
	jsonlist = JSON.parse(event.target.responseText)
   _("status").innerHTML = jsonlist["status_message"]
	$('#loader').removeClass('d-none')
	$('#results').removeClass('d-none')
	$('#table-results').removeClass('d-none')
	
	table_results.rows().remove().draw();
    if (jsonlist["reader"]){
		results = jsonlist["reader"]
		console.log(123)
		var i = 0
		for (var k in results){
			result = results[k]
			var stringArray = result; 
			
			if (result.length === 0){
			}
			
			else{
				if (results[0]===""){}
				else{
				console.log(result)
				table_results.row.add(result).draw()}
			}
			
		}	
	}
		
		
  _("progressBar").value = 0; //wil clear progress bar after successful upload
  $('#loader').addClass('d-none')
}

function errorHandler(event) {
  _("status").innerHTML = "Upload Failed";
  console.log(event)
}

function abortHandler(event) {
  _("status").innerHTML = "Upload Aborted";
}
$('.dropzone-wrapper').on('dragover', function(e) {
  e.preventDefault();
  e.stopPropagation();
  $(this).addClass('dragover');
});

$('.dropzone-wrapper').on('dragleave', function(e) {
  e.preventDefault();
  e.stopPropagation();
  $(this).removeClass('dragover');
});

$('.remove-preview').on('click', function() {
  var boxZone = $(this).parents('.preview-zone').find('.box-body');
  var previewZone = $(this).parents('.preview-zone');
  var dropzone = $(this).parents('.form-group').find('.dropzone');
  boxZone.empty();
  previewZone.addClass('hidden');
  reset(dropzone);
});


/* $("document").on('submit','#SaveToDbForm',function(e){
	alert(12345799)
	e.preventDefault();
	var table = document.getElementById("table-coordinates");
    var rows = table.getElementsByTagName('tr');
	for ( var i = 1; i < rows.length; i++) {

            rows[i].i = i;
            e = table.rows[this.i].cells[1].innerHTML;                
            n = table.rows[this.i].cells[2].innerHTML;
                 alert('East: '+e+' Nort: '+n);
        };
      $.ajax({
		type:'POST',
		url:'process_file',
		data:pdfs,
		data_type:'json'
		beforeSend:function() {
			$('#loader').removeClass('d-none')
		},
		success: function(data) {
		  if (data.status_message){
		   alert(data.status_message)
		   
		  }
		},
		complete: function(){
			  $('#loader').addClass('d-none')
		  },
	  }) */
	  
//}) */ 
//})
$(function () {
	$('#SaveToDbForm').on('submit',function (e) {
		e.preventDefault();
		var coord = new Array()
		var table = document.getElementById("table-coordinates");
		var rows = table.getElementsByTagName('tr');
		for ( var i = 1; i < rows.length; i++) {
			var cells = rows[i].getElementsByTagName('td');
            e = cells[1].innerHTML;                
			n = cells[2].innerHTML;
			coord.push([Number(e),Number(n)])
			 
        };
		console.log(JSON.stringify(coord))
    	$.ajax({
			type: 'post',
			url: 'save_to_db',
			data: {
			  'csrfmiddlewaretoken': $('input[name="csrfmiddlewaretoken"]').prop('value'),
			  'coordinates':JSON.stringify(coord),
			  'location_code':document.getElementById('location_code'),
			  'coord':coord
			},
			dataType: 'json',
			beforeSend:function() {
			$('#loader').removeClass('d-none')
			},
			success: function(data) {
			  if (data.status_message){
			   alert(data.status_message)
			   
			  }
			},
			complete: function(){
				  $('#loader').addClass('d-none')
			  },
			  });
	    e.preventDefault();
        });
})




$(document).ready( function () {
	table_coordinates =  $('#table-coordinates').DataTable();
	
		
	$('#table-coordinates').on('click', 'tbody td:not(:first-child)', function (e) {
		e.preventDefault() // I'm a noob, don't know what this means
		  // I think there is some delay on when the events trigger 
		  // so sometimes the cell still contains the input element and this check
		  // prevents accidently creating another input element
		  if (e.target.localName != 'input') {
			let row = e.target._DT_CellIndex.row
			let col = e.target._DT_CellIndex.column
			if (!e.target.children.length) {
				e.target.innerHTML = `<input id="${row}-${col}" type="text" class="editor" value="${e.target.innerHTML}">`
			}
		  }
	})

	// when the mouse exits the editor, write the data into the table and redraw
	$('#table-coordinates').on('mouseleave', 'tbody td:not(:first-child)', function (e) {
	  e.preventDefault()
	  if (e.target.localName != 'input') {
		let row = e.target._DT_CellIndex.row
		let col = e.target._DT_CellIndex.column
		table_coordinates.cell(row, col).data(e.target.firstElementChild.value)
		table_coordinates.draw() // up to you
	  }
	  else { // forces write when there is an event delay
		let [row, col] = e.target.id.split('-')
		table_coordinates.cell(Number(row), Number(col)).data(e.target.value)
	  }
	  table_coordinates.draw()
	})          
	
	
	$("#btn_plot").on("click",function(){
		const myNode = document.getElementById("map");
		myNode.innerHTML = '';
		var coord = []
		var table = document.getElementById("table-coordinates");
		var rows = table.getElementsByTagName('tr');
		for ( var i = 1; i < rows.length; i++) {
			var cells = rows[i].getElementsByTagName('td');
            e = cells[1].innerHTML;                
			n = cells[2].innerHTML;
			coord.push([Number(e),Number(n)])
			 
        };
		console.log(coord)
		let epsg_id;
		
		if (jsonlist["coordinate_system"] === 'clarke'){
			proj4.defs('EPSG:23240','+proj=utm +zone=40 +ellps=clrk80 +towgs84=-346,-1,224,0,0,0,0 +units=m +no_defs ');   
			if (ol.proj.proj4 && ol.proj.proj4.register) { ol.proj.proj4.register(proj4); }
			epsg_id = 'EPSG:23240'
		}
		if (jsonlist["coordinate_system"] === 'clark'){
			proj4.defs('EPSG:23240','+proj=utm +zone=40 +ellps=clrk80 +towgs84=-346,-1,224,0,0,0,0 +units=m +no_defs ');   
			if (ol.proj.proj4 && ol.proj.proj4.register) { ol.proj.proj4.register(proj4); }
			epsg_id = 'EPSG:23240'
		}
		if (jsonlist["coordinate_system"] === ''){
			proj4.defs('EPSG:23240','+proj=utm +zone=40 +ellps=clrk80 +towgs84=-346,-1,224,0,0,0,0 +units=m +no_defs ');   
			if (ol.proj.proj4 && ol.proj.proj4.register) { ol.proj.proj4.register(proj4); }
			epsg_id = 'EPSG:23240'
		}
		if (jsonlist["coordinate_system"] === 'wgs84'){
			proj4.defs('EPSG:32640','+proj=utm +zone=40 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');   
			if (ol.proj.proj4 && ol.proj.proj4.register) { ol.proj.proj4.register(proj4); }
			epsg_id = 'EPSG:32640'
		}
		if (jsonlist["coordinate_system"] === 'wgs 84'){
			proj4.defs('EPSG:32640','+proj=utm +zone=40 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');   
			if (ol.proj.proj4 && ol.proj.proj4.register) { ol.proj.proj4.register(proj4); }
			epsg_id = 'EPSG:32640'
		}
		if (jsonlist["coordinate_system"] === 'sohar'){
			proj4.defs('EPSG:32640','+proj=utm +zone=40 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');   
			if (ol.proj.proj4 && ol.proj.proj4.register) { ol.proj.proj4.register(proj4); }
			epsg_id = 'EPSG:32640'
		}
		if (jsonlist["coordinate_system"] === 'dhofar'){
			proj4.defs('EPSG:32639','+proj=utm +zone=39 +ellps=WGS84 +datum=WGS84 +units=m +no_defs ');   
			if (ol.proj.proj4 && ol.proj.proj4.register) { ol.proj.proj4.register(proj4); }	
			epsg_id = 'EPSG:32639'
		}
		var coordinatesPolygon = new Array();
		console.log(epsg_id)
		//convert coordinate system to "EPSG:3857"
		for (var i = 0; i < map_coordinates.length; i++) {
				var pointTransform = ol.proj.transform([coord[i][0], coord[i][1]],epsg_id, "EPSG:4326");
				console.log(pointTransform)
				coordinatesPolygon.push(pointTransform);
			}
		var center_point = coordinatesPolygon[0]
		
		const styles = [
			new ol.style.Style({
			stroke: new ol.style.Stroke({
			  color: 'blue',
			  width: 2,
			}),
			fill: new ol.style.Fill({
			  color: 'rgba(0, 0, 255, 0.1)',
			}),
		  }),
		];
				
		
		var source = new ol.source.Vector();
		var plygon = new ol.geom.Polygon([coordinatesPolygon])
		var feature = new ol.Feature({
					geometry: plygon,
				});
		source.addFeature(feature);
				
		var map = new ol.Map({
			layers: [
				new ol.layer.Tile({
					visible:true,
					preload: Infinity,
					source: new ol.source.BingMaps({
					key: 'AprfQjJDuyvs5JqN8HlL-Nd7kKVoyk_hY-rpURCq-rrhZlc2TxFmp1XpSEbEJ2v1',
					imagerySet: 'AerialWithLabelsOnDemand',
					maxZoom: 19
				  }),
				}),
				new ol.layer.Vector({
					source: source,
					style:styles
				})
			],
			target: 'map',
			view: new ol.View({
				center: center_point,
				zoom: 18,
				projection:'EPSG:4326',
			})
		});
		
	})
})
