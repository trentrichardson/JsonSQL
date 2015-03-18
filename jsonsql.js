/*! jQuery-Impromptu - v0.1.0 - 2015-03-18
* http://trentrichardson.com/jsonsql
* Copyright (c) 2015 Trent Richardson; Licensed MIT */

var jsonsql = {
		
	query: function(sql,json){

		var returnfields = sql.match(/^(select)\s+([a-z0-9_\,\.\s\*]+)\s+from\s+([a-z0-9_\.]+)(?: where\s+\((.+)\))?\s*(?:order\sby\s+([a-z0-9_\,]+))?\s*(asc|desc|ascnum|descnum)?\s*(?:limit\s+([0-9_\,]+))?/i);
		
		var ops = { 
			fields: returnfields[2].replace(' ','').split(','), 
			from: returnfields[3].replace(' ',''), 
			where: (returnfields[4] == undefined)? "true":returnfields[4],
			orderby: (returnfields[5] == undefined)? []:returnfields[5].replace(' ','').split(','),
			order: (returnfields[6] == undefined)? "asc":returnfields[6],
			limit: (returnfields[7] == undefined)? []:returnfields[7].replace(' ','').split(',')
		};

		return this.parse(json, ops);		
	},
	
	parse: function(json,ops){
		var o = { fields:["*"], from:"json", where:"", orderby:[], order: "asc", limit:[] };
		for(i in ops) o[i] = ops[i];

		var result = [];		
		result = this.returnFilter(json,o);
		result = this.returnOrderBy(result,o.orderby,o.order);
		result = this.returnLimit(result,o.limit);
				
		return result;
	},
	
	returnFilter: function(json,jsonsql_o){
		
		var jsonsql_scope = eval(jsonsql_o.from);
		var jsonsql_result = [];
		var jsonsql_rc = 0;

		if(jsonsql_o.where == "") 
			jsonsql_o.where = "true";

		for(var jsonsql_i in jsonsql_scope){
			with(jsonsql_scope[jsonsql_i]){
				if(eval(jsonsql_o.where)){
					jsonsql_result[jsonsql_rc++] = this.returnFields(jsonsql_scope[jsonsql_i],jsonsql_o.fields);
				}
			}
		}
		
		return jsonsql_result;
	},
	
	returnFields: function(scope,fields){
		if(fields.length == 0)
			fields = ["*"];
			
		if(fields[0] == "*")
			return scope;
			
		var returnobj = {};
		for(var i in fields)
			returnobj[fields[i]] = scope[fields[i]];
		
		return returnobj;
	},
	
	returnOrderBy: function(result,orderby,order){
		if(orderby.length == 0) 
			return result;
		
		result.sort(function(a,b){	
			switch(order.toLowerCase()){
				case "desc": return (eval('a.'+ orderby[0] +' < b.'+ orderby[0]))? 1:-1;
				case "asc":  return (eval('a.'+ orderby[0] +' > b.'+ orderby[0]))? 1:-1;
				case "descnum": return (eval('a.'+ orderby[0] +' - b.'+ orderby[0]));
				case "ascnum":  return (eval('b.'+ orderby[0] +' - a.'+ orderby[0]));
			}
		});

		return result;	
	},
	
	returnLimit: function(result,limit){
		switch(limit.length){
			case 0: return result;
			case 1: return result.splice(0,limit[0]);
			case 2: return result.splice(limit[0]-1,limit[1]);
		}
	}
	
};