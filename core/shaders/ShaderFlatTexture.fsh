//
//  ShaderFlatTexture.fsh
//  ExtrudeDraw
//
//  Created by William on 10/9/12.
//  Copyright (c) 2012
//

uniform sampler2D uSampler;

varying lowp vec4 vColor;
varying lowp vec2 vUV;

void main()
{
    gl_FragColor = vColor * texture2D(uSampler, vUV);
}
