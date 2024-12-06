


export class Vertex_Shader_Builder {
    constructor(){
        // setup our lists and references
        this.block_padding = "    ";

        this.uniform_declarations_list = [
            "// --- uniforms, for all vertices ---",
        ];
        this.attribute_declarations_list = [
            "// --- attributes, for current vertex ---",
        ];
        this.varying_declarations_list = [
            "// --- varyings, for fragment shader, interpolated ---",
        ];
        this.initialisation_lines = [
            `${this.block_padding}// --- initialise data ----`,
        ];
        this.gl_settings_lines = [
            `${this.block_padding}// --- prepare settings ----`,
        ];
        this.varying_assignments_lines = [
            `${this.block_padding}// --- assign varyings ----`,
        ];
    }

    // ##################################################################################################
    // ##################################################################################################
    // ##################################################################################################
    // ###################################################################### INSTANCE METHODS BELOW HERE
    
    
    // =====================================================================================
    // =====================================================================================
    // ========== for adding lines to individual code blocks

    // --------------------------------------------------------
    // --------------------------------------------------------
    // --------- declarations

    /**
     * add uniform to the list of uniforms available in the vertex shader
     * 
     * this value stays the same for all vertices using an instance of this shader
     * @param {*} uniform_type `float`/`vec2`/`vec3`/`vec4`/`mat2`/`mat3`/`mat4` or some other allowable type by webgl 1
     * @param {*} uniform_name the identifying name to use for the uniform
     * @param {*} uniform_comment_line optional comment line before the uniform declaration
     */
    add_uniform_declaration(uniform_type, uniform_name, uniform_comment_line){
        // when we define a comment to include, add it first
        if(uniform_comment_line!=undefined){ this.uniform_declarations_list.push(`// ${uniform_comment_line}`); }
        // add the uniform declaration
        this.uniform_declarations_list.push(`uniform ${uniform_type} u_${uniform_name};`);
    }
    /**
     * add attribute to the list of attributes available in the vertex shader
     * 
     * this value usually changes between instances of this shader, depending on the buffer used
     * @param {*} attribute_type `float`/`vec2`/`vec3`/`vec4`/`mat2`/`mat3`/`mat4` or some other allowable type by webgl 1
     * @param {*} attribute_name the identifying name to use for the attribute
     * @param {*} attribute_comment_line optional comment line before the attribute declaration
     */
    add_attribute_declaration(attribute_type, attribute_name, attribute_comment_line){
        // when we define a comment to include, add it first
        if(attribute_comment_line!=undefined){ this.attribute_declarations_list.push(`// ${attribute_comment_line}`); }
        // add the attribute declaration
        this.attribute_declarations_list.push(`attribute ${attribute_type} a_${attribute_name};`);
    }
    /**
     * add varying to the list of varyings available in the fragment shader
     * 
     * this value needs to be assigned during the vertex shader but then is interpolated over
     * connecting edges to have a per fragment value based on where the fragment lies between
     * the connected vertices
     * 
     * #### references for how the interpolation works
     * * uses barycentric coordinate system to locate the fragment within a triangle/face
     * * then takes from the three corner values, based on the barycentric coordinates
     * * [toy program to help with visualising](https://www.barycentric-coordinates.com/) *(super concise)*
     * * [sebastian lague youtube video](https://www.youtube.com/watch?v=HYAgJN3x4GA) *(recommended)*
     * * [scratch a pixel page](https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/barycentric-coordinates.html) *(recommended)*
     * * [super thorough exploration on youtube](https://www.youtube.com/watch?v=63WG_MAgyS4) *(useful for when sebastian's video wasnt enough information)*
     * * [community college lecture on youtube](https://www.youtube.com/watch?v=aNpBlGbZ6tw) *(useful for people who dont know that accents make it easier to learn)*
     * * [wikipedia page](https://en.wikipedia.org/wiki/Barycentric_coordinate_system) *(for people with maths backgrounds)*
     * * [wolfram page](https://mathworld.wolfram.com/BarycentricCoordinates.html) *(maths focused)*
     * * [stack overflow post talking about it](https://gamedev.stackexchange.com/questions/23743/whats-the-most-efficient-way-to-find-barycentric-coordinates) *(efficiency brainstorming)*
     * * [berkeley micro-lecture youtube video](https://www.youtube.com/watch?v=xe90Fi7yAgI) *(super brief)*
     * * [another micro-lecture on youtube using a whiteboard](https://www.youtube.com/watch?v=vQciREU7Olg) *(less brief, heavy jargon)*
     * @param {*} varying_precision `lowp`/`mediump`/`highp` - some varying precision value allowable by webgl 1
     * @param {*} varying_type `float`/`vec2`/`vec3`/`vec4`/`mat2`/`mat3`/`mat4` - some allowable type by webgl 1
     * @param {*} varying_name the identifying name to use for the varying
     * @param {*} varying_comment_line optional comment line before the varying declaration
     */
    add_varying_declaration(varying_precision, varying_type, varying_name, varying_comment_line){
        // when we define a comment to include, add it first
        if(varying_comment_line!=undefined){ this.varying_declarations_list.push(`// ${varying_comment_line}`); }
        // add the varying declaration
        this.varying_declarations_list.push(`varying ${varying_precision} ${varying_type} v_${varying_name};`);
    }
    
    // --------------------------------------------------------
    // --------------------------------------------------------
    // --------- code lines

    add_initialisation_line(line_to_add){
        this.initialisation_lines.push(`${this.block_padding}${line_to_add}`);
    }
    add_gl_settings_line(line_to_add){
        this.gl_settings_lines.push(`${this.block_padding}${line_to_add}`);
    }
    add_varying_assignments_line(line_to_add){
        this.varying_assignments_lines.push(`${this.block_padding}${line_to_add}`);
    }

    // --------------------------------------------------------
    // --------------------------------------------------------

    // =====================================================================================
    // =====================================================================================
    // ========== for adding functionality to the code
    
    // --------------------------------------------------------
    // --------------------------------------------------------
    // --------- vector attribute piping

    /**
     * pipes the attribute straight through to fragment shader
     * @param {*} attribute_type 
     * @param {*} attribute_name 
     */
    add_raw_interpolated_attribute(attribute_type, attribute_name, varying_name){
        this.add_attribute_declaration(attribute_type, attribute_name);
        this.add_varying_declaration("highp", attribute_type, varying_name);
        this.add_varying_assignments_line(`v_${varying_name} = a_${attribute_name};`);
    }
    /**
     * pipes the attribute as normalized through to fragment shader
     * @param {*} attribute_type 
     * @param {*} attribute_name 
     */
    add_normalized_interpolated_attribute(attribute_type, attribute_name, varying_name){
        this.add_attribute_declaration(attribute_type, attribute_name);
        this.add_varying_declaration("highp", attribute_type, varying_name);
        this.add_varying_assignments_line(`v_${varying_name} = normalize( a_${attribute_name} );`);
    }
    /**
     * pipes a vec4 attribute with the w value replaced
     * @param {*} attribute_name 
     */
    add_w_stripped_vec4_interpolated_attribute(attribute_name, varying_name, new_w_value){
        this.add_attribute_declaration("vec4", attribute_name);
        this.add_varying_declaration("highp", "vec4", varying_name);
        this.add_varying_assignments_line(`v_${varying_name} = vec4( a_${attribute_name}.xyz, ${new_w_value} );`);
    }
    /**
     * pipes a vec4 attribute with the w value replaced and the contents normalized
     * @param {*} attribute_name 
     */
    add_w_stripped_normalized_vec4_interpolated_attribute(attribute_name, varying_name, new_w_value){
        this.add_attribute_declaration("vec4", attribute_name);
        this.add_varying_declaration("highp", "vec4", varying_name);
        this.add_varying_assignments_line(`v_${varying_name} = vec4( normalize( a_${attribute_name}.xyz ), ${new_w_value} );`);
    }

    // --------------------------------------------------------
    // --------------------------------------------------------
    // --------- positioning

    /**
     * add the position assignment line
     * @param {*} value_to_use must resolve as `vec4` type in webgl 1
     */
    add_position_setting(value_to_use){
        this.add_gl_settings_line(`gl_Position = ${value_to_use};`);
    }
    /**
     * adds the transformation matrix declaration and uses it on whatever value we have in `vertex_position_vec4`
     * @param {*} matrix_uniform_name the name of the matrix uniform without the preceding `u_`
     * @param {*} vertex_position_vec4 resolves to be a vec4 which is used as a vertex position (w component is 1.0)
     */
    add_model_to_ndc_mat4(matrix_uniform_name, vertex_position_vec4){
        this.add_uniform_declaration("mat4", matrix_uniform_name, "(model -> world -> camera -> clip -> NDC) matrix");
        this.add_position_setting(`u_${matrix_uniform_name} * ${vertex_position_vec4}`);
    }
    /**
     * adds standard vec4 vertex position attribute
     * @param {*} position_attribute_name name of the vertex position attribute without the `a_`
     */
    add_vertex_position_vec4(position_attribute_name){
        this.add_attribute_declaration("vec4",position_attribute_name, "position within model-space of the current vertex");
    }
    /**
     * adds
     * * `mat4` model-to-ndc matrix uniform
     * * `vec4` model-space-position vertex attribute
     * 
     * then has `gl_Position` become: `{model-to-ndc}  *  {model-space-position}`
     * 
     * without any changes to anything
     * @param {*} model_to_ndc_matrix_name raw uniform name without `u_`
     * @param {*} vertex_position_name raw attribute name without `a_`
     */
    add_conventional_vertex_positioning(model_to_ndc_matrix_name, vertex_position_name){
        this.add_vertex_position_vec4( vertex_position_name );
        this.add_model_to_ndc_mat4( model_to_ndc_matrix_name, `a_${vertex_position_name}` );
    }

    // --------------------------------------------------------
    // --------------------------------------------------------
    // --------- sizing

    /**
     * adding a specific size for points
     * @param {*} size_setting 
     */
    add_point_size_setting(size_setting){
        this.add_gl_settings_line(`gl_PointSize = ${size_setting};`)
    }
    /**
     * adds the point size attribute
     * @param {*} size_attribute_name 
     */
    add_point_size_attribute(size_attribute_name){
        this.add_attribute_declaration("float", size_attribute_name, "size of the current vertex's point");
        this.add_point_size_setting(`a_${size_attribute_name}`);
    }

    // =====================================================================================
    // =====================================================================================
    // ==================== CODE BLOCK PREPARATION FUNCTIONS

    get_uniform_declarations_code(){
        // always at least 1 thing, no need to check for empty
        return `${this.uniform_declarations_list.join("\n")}\n\n`;
    }
    get_attribute_declarations_code(){
        // always at least 1 thing, no need to check for empty
        return `${this.attribute_declarations_list.join("\n")}\n\n`;
    }
    get_varying_declarations_code(){
        // check for more than the header comment, otherwise empty string
        return (this.varying_declarations_list.length > 1)? `${this.varying_declarations_list.join("\n")}\n\n`:"";
    }
    get_pre_intialisation_code(){
        // check for more than the header comment, otherwise empty string
        return (this.initialisation_lines.length > 1)? `${this.initialisation_lines.join("\n")}\n\n`:"";
    }
    get_gl_settings_code(){
        // always at least 1 thing, no need to check for empty
        return `${this.gl_settings_lines.join("\n")}\n\n`;
    }
    get_varying_assignments_code(){
        // check for more than the header comment, otherwise empty string
        return (this.varying_assignments_lines.length > 1)? `${this.varying_assignments_lines.join("\n")}\n\n`:"";
    }

    // =====================================================================================
    // =====================================================================================
    // ================== BUILD OUR SHADER SOURCE

    make_source(){
        // build the declarations portion
        let declarations = `${this.get_uniform_declarations_code()}${this.get_attribute_declarations_code()}${this.get_varying_declarations_code()}`;
        // construct the main function
        //  extra lines added to follow the trend
        let void_main = `void main(){\n\n${this.get_pre_intialisation_code()}${this.get_gl_settings_code()}${this.get_varying_assignments_code()}}`
        // combine them together
        //  no space added since it was added when the blocks were fetched
        this.source = `${declarations}${void_main}`;
    }
    
    // =====================================================================================
    // =====================================================================================
    // ================== FETCH OUR SHADER SOURCE

    /**
     * makes and fetches the source for this shader
     * @returns source code made from this builder
     */
    get_source(){
        this.make_source();
        return this.source;
    }
    
    // =====================================================================================
    // =====================================================================================

    // ##################################################################################################
    // ##################################################################################################
    // ##################################################################################################
    // ######################################################################## STATIC METHODS BELOW HERE
    
    // =====================================================================================
    // =====================================================================================
    // ================== BUILD SHADER

    /**
     * generates the build settings structure for `build_with_settings`
     * @param {*} is_point_size 
     * @param {*} is_vertex_colour 
     * @param {*} is_vertex_normal 
     * @param {*} is_uv_mapping 
     * @returns 
     */
    static generate_conventional_settings( is_point_size, is_vertex_colour, is_vertex_normal, is_uv_mapping ){
        return {
            model_to_ndc:  {type: "mat4",  name: "model_to_ndc_matrix", using: true             },
            position:      {type: "vec4",  name: "vertex_position",     using: true             },
            vertex_size:   {type: "float", name: "vertex_size",         using: is_point_size    },
            colour:        {type: "vec4",  name: "vertex_colour",       using: is_vertex_colour },
            normal:        {type: "vec3",  name: "vertex_normal",       using: is_vertex_normal },
            uv_mapping:    {type: "vec2",  name: "vertex_uv_mapping",   using: is_uv_mapping    },
        };
    }

    /**
     * builds source based on provided settings
     * @param {*} build_settings 
     * @returns 
     */
    static build_with_settings(build_settings){
        // ---------------------------------------------------
        // ---- make the instance

        let shader_builder = new Vertex_Shader_Builder();

        // ---------------------------------------------------
        // ---- add in the data

        // since they're always existing
        shader_builder.add_conventional_vertex_positioning( build_settings.model_to_ndc.name, build_settings.position.name );

        // when sizing our points
        if(build_settings.vertex_size.using){
            shader_builder.add_point_size_attribute(build_settings.vertex_size.name);
        }
        // when vertex colouring 
        if(build_settings.colour.using){
            // always full alpha
            shader_builder.add_w_stripped_vec4_interpolated_attribute( build_settings.colour.name, build_settings.colour.name, "1.0" );
        }
        // when we're using the normal
        if(build_settings.normal.using){
            // havent got a fragment shader builder yet so hard code the varying name
            shader_builder.add_normalized_interpolated_attribute( build_settings.normal.type, build_settings.normal.name, "normal" );
        }
        // when we're using the uv mapping
        if(build_settings.uv_mapping.using){
            // havent got a fragment shader builder yet so hard code the varying name
            shader_builder.add_raw_interpolated_attribute( build_settings.uv_mapping.type, build_settings.uv_mapping.name, "uv_mapping");
        }

        // ---------------------------------------------------
        // ---- give back the instance

        return shader_builder;
    }

    /**
     * standard entry point for vertex shader builder users
     * 
     * handles creating the settings and asking for the building, then sends back a constructed vertex shader builder instance
     * @param {*} is_point_size if we're sizing our points
     * @param {*} is_vertex_colour if we're colouring our vertices
     * @param {*} is_vertex_normal if we're providing normals
     * @param {*} is_uv_mapping if we're using uv mapping
     * @returns the shader builder instance ready for the shader source to be retrieved
     */
    static build_vertex_shader( is_point_size, is_vertex_colour, is_vertex_normal, is_uv_mapping ){
        const build_settings = Vertex_Shader_Builder.generate_conventional_settings( is_point_size, is_vertex_colour, is_vertex_normal, is_uv_mapping );
        return Vertex_Shader_Builder.build_with_settings( build_settings );
    }
}