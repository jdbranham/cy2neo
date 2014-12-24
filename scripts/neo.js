function Neo(urlSource) {
	function txUrl() {
		var url = (urlSource() || "http://localhost:7474").replace(/\/db\/data.*/,"");
		return url + "/db/data/cypher";
	}
	var me = {
		executeQuery: function(query, params, cb) {
			$.ajax(txUrl(), {
				type: "POST",
				data: JSON.stringify({
					  query : query,
					  params : params || {}
				}),
				contentType: "application/json",
				error: function(err) {
					cb(err);
				},
				success: function(res) {
					if (res.exception) {
						cb(res.exception);
					} else {
						var cols = res.columns;
						var rows = res.data.map(function(row) {
							var r = {};
							cols.forEach(function(col, index) {
								r[col] = row[index];
							});
							return r;
						});
						var nodes = [];
						var rels = [];
						var labels = [];
						res.data.forEach(function(row) {
							
							var n = row[0]['data'];
							
							for (var property in n) {
							    if (Object.hasOwnProperty(property)) {
							    	var found = nodes.filter(function (m) { return m.id == n.id; }).length > 0;
									   if (!found) {
										  var node = n.properties||{}; node.id=n.id;node.type=n.name;
										  nodes.push(node);
										  if (labels.indexOf(node.type) == -1) labels.push(node.type);
									   }
							    }
							}
							
							//rels = rels.concat(row.graph.relationships.map(function(r) { return { source:r.startNode, target:r.endNode, caption:r.type} }));
							
							/*row.graph.nodes.forEach(function(n) {
							   var found = nodes.filter(function (m) { return m.id == n.id; }).length > 0;
							   if (!found) {
								  var node = n.properties||{}; node.id=n.id;node.type=n.labels[0];
								  nodes.push(node);
								  if (labels.indexOf(node.type) == -1) labels.push(node.type);
							   }
							});*/
							
							//rels = rels.concat(row.graph.relationships.map(function(r) { return { source:r.startNode, target:r.endNode, caption:r.type} }));
						});
						cb(null,{table:rows,graph:{nodes:nodes, edges:rels},labels:labels});
					}
				}
			});
		}
	};
	return me;
}
