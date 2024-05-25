
function VertexStruct()	//constructor
{
	this.is_set = false;
	this.position = [];
	this.textureIndex = -1;
	this.normalIndex = -1;
	this.nextIndex = -1;
}

function loadObjModel( filepath)
{
    var fileData;

	var vertexArray = [];
	var textureArray = [];
	var normalArray = [];
	var indicesArray = [];

    //var fileReader = new FileReader();
    //console.log(this);
	var xmlHttp = new XMLHttpRequest();

	xmlHttp.onload = function() {
		if(xmlHttp.readyState == 4)
		{

			/*
				bool is_set;
				float position[3];
				int textureIndex;
				int normalIndex;
				int nextIndex;
			*/
			var verticesStructArray = [];

			var tempTexArray = [];
			var tempNormArray = [];

			var verticesIndex = [];
			var textureIndex = [];
			var normalIndex = [];
			var x, y, z;

			let vi, ni, ti;

			fileData = xmlHttp.response;
            let vLength;

			let stringArray = fileData.split('\n');
			for( let i = 0; i < stringArray.length; i++)
			{
				let line = stringArray[i];
				let token = line.split( ' ');

				if(token[0] == 'v')
				{
					x = parseFloat(token[1]);
					y = parseFloat(token[2]);
					z = parseFloat(token[3]);

					let temp = new VertexStruct();
					//console.log(temp);
					temp.position.push(x);
					temp.position.push(y);
					temp.position.push(z);

					verticesStructArray.push( temp);
				}
				else if( token[0] == 'vt')
				{
					tempTexArray.push( parseFloat(token[1]));
					tempTexArray.push( parseFloat(token[2]));
				}
				else if( token[0] == 'vn')
				{
					tempNormArray.push( parseFloat( token[1]));
					tempNormArray.push( parseFloat( token[2]));
					tempNormArray.push( parseFloat( token[3]));
				}
				else if( token[0] == 'f')
				{
					for( let j = 1; j <= 3; j++)
					{
						let faceVertex = token[j].split('/');
						vi = parseInt( faceVertex[0]) - 1;
						ti = parseInt( faceVertex[1]) - 1;
						ni = parseInt( faceVertex[2]) - 1;

						verticesIndex.push( vi);
						textureIndex.push( ti);
						normalIndex.push( ni);
					}
				}
			}

			for( let i = 0; i < verticesIndex.length; i++)
			{
				vi = verticesIndex[i];
				ti = textureIndex[i];
				ni = normalIndex[i];

				//verticesStructArray[index];
				if( verticesStructArray[vi].is_set == false)
				{
					verticesStructArray[vi].is_set = true;
					verticesStructArray[vi].textureIndex = ti;
					verticesStructArray[vi].normalIndex = ni;

					indicesArray.push( vi);
				}
				else
				{
					if(
						verticesStructArray[vi].textureIndex == ti &&
						verticesStructArray[vi].normalIndex == ni
					)
					{
						//data already in indices array
						indicesArray.push( vi);
					}
					else
					{
						let found = false;

							//get next index
						index = vi;

						while( verticesStructArray[index].nextIndex != -1)
						{
							index = verticesStructArray[index].nextIndex;
							if(verticesStructArray[index].textureIndex == ti &&
								verticesStructArray[index].normalIndex == ni
							)
							{
								found = true;
								indicesArray.push( index);
								break;
							}
						}

						if( found == false)
						{
							let temp = new VertexStruct();

							temp.is_set = true;
							temp.nextIndex = -1;
							temp.textureIndex = ti;
							//temp.normalIndex = ni;
							temp.position.push( verticesStructArray[index].position[0]);
							temp.position.push( verticesStructArray[index].position[1]);
							temp.position.push( verticesStructArray[index].position[2]);

							verticesStructArray[index].nextIndex = verticesStructArray.length; //value store at the last position in array
							indicesArray.push( verticesStructArray.length); //store position
							verticesStructArray.push(temp); //store data
						}
					}
				}
			}

		//	console.log( "verticesIndex: " + verticesIndex.length);
		//	console.log( "textureIndex : " + textureIndex.length);
		//	console.log( "normalIndex  : " + normalIndex.length);

			//store actual vertex data in arrays
			for(let i = 0; i < verticesStructArray.length; i++)
			{
				ti = verticesStructArray[i].textureIndex;
				ni = verticesStructArray[i].normalIndex;

				vertexArray.push( verticesStructArray[i].position[0]);
				vertexArray.push( verticesStructArray[i].position[1]);
				vertexArray.push( verticesStructArray[i].position[2]);

				textureArray.push( tempTexArray[2*ti + 0]);
				textureArray.push( tempTexArray[2*ti + 1]);

				normalArray.push( tempNormArray[3*ni + 0]);
				normalArray.push( tempNormArray[3*ni + 1]);
				normalArray.push( tempNormArray[3*ni + 2]);
			}

	//		console.log( "Obj Loader: Vertex Count  : ", vertexArray.length/3);
	//		console.log( "Obj Loader: Texture count : ", textureArray.length/2);
	//		console.log( "Obj Loader: Normal Count  : ", normalArray.length/3);
	//		console.log( "Obj Loader: Index Count   : ", indicesArray.length);
	//		console.log( "Obj Loader: Faces Count   : ", indicesArray.length/3);

			//clean up
			let size = verticesStructArray.length;
			for( let i = 0; i < size; i++)
			{
				delete(verticesStructArray[i]);
			}
		}
    };


	xmlHttp.open( "GET", filepath, false);
	xmlHttp.send();

//    console.log("Done");

	return {
		vertices: new Float32Array( vertexArray),
		textures: new Float32Array( textureArray),
		normals: new Float32Array( normalArray),
		indices: new Int32Array( indicesArray)
	}
}
