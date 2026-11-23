/* Locations and courses. Course names and coordinates are real; prices (base) are sample values.
   `base` = sample weekday 18-hole green fee in USD. `url` = verified booking page (only when known). */
const PLACES=[
 ["Downtown Salt Lake City",40.7608,-111.8910],["University of Utah",40.7649,-111.8421],["Sugar House",40.7230,-111.8590],
 ["Murray",40.6669,-111.8880],["West Valley City",40.6916,-112.0011],["West Jordan",40.6097,-111.9391],
 ["Sandy",40.5649,-111.8389],["South Jordan",40.5622,-111.9297],["Draper",40.5247,-111.8638],["Lehi",40.3916,-111.8508]
];
const SEARCH=q=>"https://www.google.com/search?q="+encodeURIComponent(q+" tee times");
const COURSES=[
 {id:"bonneville",name:"Bonneville Golf Course",city:"Salt Lake City",lat:40.7425,lng:-111.8203,base:52,walk:true},
 {id:"forestdale",name:"Forest Dale Golf Course",city:"Salt Lake City",lat:40.7155,lng:-111.8686,base:24,walk:true,nineOnly:true},
 {id:"glendale",name:"Glendale Golf Course",city:"Salt Lake City",lat:40.7105,lng:-111.9372,base:44,walk:true},
 {id:"mtndell",name:"Mountain Dell Golf Course",city:"Salt Lake City",lat:40.7468,lng:-111.7206,base:56,walk:false},
 {id:"nibley",name:"Nibley Park Golf Course",city:"Salt Lake City",lat:40.7085,lng:-111.8640,base:22,walk:true,nineOnly:true},
 {id:"rosepark",name:"Rose Park Golf Course",city:"Salt Lake City",lat:40.7930,lng:-111.9285,base:42,walk:true},
 {id:"mtnview",name:"Mountain View Golf Course",city:"West Jordan",lat:40.5935,lng:-111.9752,base:46,walk:true,url:"https://www.chronogolf.com/club/mountain-view-slco"},
 {id:"southmtn",name:"South Mountain Golf Course",city:"Draper",lat:40.4900,lng:-111.8640,base:62,walk:false,url:"https://chronogolf.com/club/south-mountain-slco"},
 {id:"oldmill",name:"Old Mill Golf Course",city:"Cottonwood Heights",lat:40.6280,lng:-111.8130,base:50,walk:true},
 {id:"meadowbrook",name:"Meadowbrook Golf Course",city:"Taylorsville",lat:40.6720,lng:-111.9200,base:42,walk:true},
 {id:"riveroaks",name:"River Oaks Golf Course",city:"Sandy",lat:40.5640,lng:-111.8650,base:45,walk:true},
 {id:"glenmoor",name:"Glenmoor Golf Club",city:"South Jordan",lat:40.5930,lng:-111.9370,base:49,walk:true},
 {id:"riverbend",name:"Riverbend Golf Course",city:"Riverton",lat:40.5150,lng:-111.9410,base:44,walk:true},
 {id:"stonebridge",name:"Stonebridge Golf Club",city:"West Valley City",lat:40.7120,lng:-112.0050,base:48,walk:true},
 {id:"thanksgiving",name:"Thanksgiving Point Golf Club",city:"Lehi",lat:40.4280,lng:-111.8890,base:75,walk:false},
 {id:"foxhollow",name:"Fox Hollow Golf Club",city:"American Fork",lat:40.3790,lng:-111.8030,base:48,walk:true}
];

