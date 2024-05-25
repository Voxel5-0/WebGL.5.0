function Mesh()
{
    var elements=[];
    var verts=[];
    var norms=[];
    var texCoords=[];

    var numElements=0;
    var maxElements=0;
    var numVertices=0;

    var vbo_position=0;
    var vbo_normal=0;
    var vbo_texture=0;
    var vbo_index=0;
    var vao=0;

    this.allocate=function(numIndices)
    {
        cleanupMeshData();

        maxElements = numIndices;
        numElements = 0;
        numVertices = 0;

        var iNumIndices=numIndices/3;

        elements = new Uint16Array(iNumIndices * 3 * 2);
        verts = new Float32Array(iNumIndices * 3 * 4);
        norms = new Float32Array(iNumIndices * 3 * 4);
        texCoords = new Float32Array(iNumIndices * 2 * 4);
    }
this.addTriangle=function(single_vertex, single_normal, single_texture)
    {
        const diff = 0.00001;
        var i, j;
        normalizeVector(single_normal[0]);
        normalizeVector(single_normal[1]);
        normalizeVector(single_normal[2]);

        for (i = 0; i < 3; i++)
        {
            for (j = 0; j < numVertices; j++)
            {
                if (isFoundIdentical(verts[j * 3], single_vertex[i][0], diff) &&
                    isFoundIdentical(verts[(j * 3) + 1], single_vertex[i][1], diff) &&
                    isFoundIdentical(verts[(j * 3) + 2], single_vertex[i][2], diff) &&

                    isFoundIdentical(norms[j * 3], single_normal[i][0], diff) &&
                    isFoundIdentical(norms[(j * 3) + 1], single_normal[i][1], diff) &&
                    isFoundIdentical(norms[(j * 3) + 2], single_normal[i][2], diff) &&

                    isFoundIdentical(texCoords[j * 2], single_texture[i][0], diff) &&
                    isFoundIdentical(texCoords[(j * 2) + 1], single_texture[i][1], diff))
                {
                    elements[numElements] = j;
                    numElements++;
                    break;
                }
            }
            if (j == numVertices && numVertices < maxElements && numElements < maxElements)
            {
                verts[numVertices * 3] = single_vertex[i][0];
                verts[(numVertices * 3) + 1] = single_vertex[i][1];
                verts[(numVertices * 3) + 2] = single_vertex[i][2];

                norms[numVertices * 3] = single_normal[i][0];
                norms[(numVertices * 3) + 1] = single_normal[i][1];
                norms[(numVertices * 3) + 2] = single_normal[i][2];

                texCoords[numVertices * 2] = single_texture[i][0];
                texCoords[(numVertices * 2) + 1] = single_texture[i][1];

                elements[numElements] = numVertices;
                numElements++;
                numVertices++;
            }
        }
    }

    this.prepareToDraw=function()
    {
        vao=gl.createVertexArray();
        gl.bindVertexArray(vao);
        vbo_position=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vbo_position);
        gl.bufferData(gl.ARRAY_BUFFER,verts,gl.STATIC_DRAW);
        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX,
                               3,
                               gl.FLOAT,
                               false,0,0);
        gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);

       vbo_normal=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vbo_normal);
        gl.bufferData(gl.ARRAY_BUFFER,
                      norms,
                      gl.STATIC_DRAW);
        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_NORMAL,
                               3,
                               gl.FLOAT,
                               false,0,0);
        gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_NORMAL);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);

        vbo_texture=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vbo_texture);
        gl.bufferData(gl.ARRAY_BUFFER,
                      texCoords,
                      gl.STATIC_DRAW);
        gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,
                               2,
                               gl.FLOAT,
                               false,0,0);
        gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        vbo_index=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,vbo_index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                      elements,
                      gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.bindVertexArray(null);
        cleanupMeshData();
    }

    this.draw=function()
    {
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_index);
        gl.drawElements(gl.TRIANGLES, numElements, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

    this.getIndexCount=function()
    {
        return(numElements);
    }

    this.getVertexCount=function()
    {
            return(numVertices);
    }

    normalizeVector=function(v)
    {
        var squaredVectorLength=(v[0] * v[0]) + (v[1] * v[1]) + (v[2] * v[2]);
        var squareRootOfSquaredVectorLength=Math.sqrt(squaredVectorLength);

        v[0] = v[0] * 1.0/squareRootOfSquaredVectorLength;
        v[1] = v[1] * 1.0/squareRootOfSquaredVectorLength;
        v[2] = v[2] * 1.0/squareRootOfSquaredVectorLength;
    }

    isFoundIdentical=function(val1, val2, diff)
    {
        if(Math.abs(val1 - val2) < diff)
            return(true);
        else
            return(false);
    }

    cleanupMeshData=function()
    {
        if(elements!=null)
        {
            elements=null;
        }

        if(verts!=null)
        {
            verts=null;
        }

        if(norms!=null)
        {
            norms=null;
        }

        if(texCoords!=null)
        {
            texCoords=null;
        }
    }

    this.deallocate=function()
    {
        if(vao)
        {
            glContext.deleteVertexArray(vao);
            vao=null;
        }

        if(vbo_index)
        {
            glContext.deleteBuffer(vbo_index);
            vbo_index=null;
        }

        if(vbo_texture)
        {
            glContext.deleteBuffer(vbo_texture);
            vbo_texture=null;
        }

        if(vbo_normal)
        {
            glContext.deleteBuffer(vbo_normal);
            vbo_normal=null;
        }

        if(vbo_position)
        {
            glContext.deleteBuffer(vbo_position);
            vbo_position=null;
        }
    }
}
