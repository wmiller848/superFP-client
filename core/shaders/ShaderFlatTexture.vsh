//
//  ShaderFlatTexture.vsh
//  ExtrudeDraw
//
//  Created by William on 10/9/12.
//  Copyright (c) 2012
//

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec4 vColor;
varying lowp vec2 vUV;

void main()
{
    mat4 modelViewMatrix = uViewMatrix * uModelMatrix;
    vec4 position = modelViewMatrix * vec4(aVertexPosition,1.0);
    
    vColor = vec4(1.0, 1.0, 1.0, 1.0);
    vUV = aTextureCoord;
    gl_Position = uProjectionMatrix * position;
}
