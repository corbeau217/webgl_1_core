
// ############################################################################################
// ############################################################################################
// ############################################################################################

export class Managed_Shader {

    // ###########################################
    // ###########################################

    constructor( shader_id, gl_context, vertex_shader_source, fragment_shader_source ){
        // --------------------------------
        // --- declare program as null for testing
        this.shader_program = null;
        // --------------------------------
        // --- save our data
        this.id = shader_id;
        this.gl_context = gl_context;
        this.vertex_source = vertex_shader_source;
        this.fragment_source = fragment_shader_source;
        // --------------------------------
        // --- announce settings
        this.verbose_logging = true;
        this.preserve_attributes_on_shader_replacement = true;
        // --------------------------------
        // --- prepare attribute data
        this.attribute_location_list = [];
        // --------------------------------
    }

    // ###########################################
    // ###########################################
    // #### initialise function used by manager

    initialise(){
        // --------------------------------
        // --- compile and link
        this.initialise_shaders();
        // --------------------------------
    }

    // ###########################################
    // ###########################################

    generate_shader_program(){
        // TODO: probably could just replace the changes rather than remaking from scratch?
        if(this.shader_program!=null){
            // delete old
            this.gl_context.deleteProgram(this.shader_program);
        }
        // make them
        this.initialise_shaders();
    }
    compile_shader( shader_type ){
        // prepare references
        let compiling_shader, shader_source;

        // determine which shader to change
        switch (shader_type) {
            case this.gl_context.VERTEX_SHADER:
                this.vertex_compiled_shader = this.gl_context.createShader(shader_type);
                compiling_shader = this.vertex_compiled_shader
                shader_source = this.vertex_source;
                break;
            case this.gl_context.FRAGMENT_SHADER:  
                this.fragment_compiled_shader = this.gl_context.createShader(shader_type);
                compiling_shader = this.fragment_compiled_shader;
                shader_source = this.fragment_source;
                break;
        
            default:
                if(this.verbose_logging){
                    console.log("requested loading an unknown shader type!");
                }
                return;
        }

        // send the source to the shader object
        this.gl_context.shaderSource(compiling_shader, shader_source);
        
        // compile the shader program
        this.gl_context.compileShader(compiling_shader);

        if(this.verbose_logging){
            // see if it compiled successfully
            if( !this.gl_context.getShaderParameter(compiling_shader, this.gl_context.COMPILE_STATUS) ){ // seems we can get a lot from canvas elements
                console.log(
                    // very interesting that theres' an info log, does this mean we can debug webgl irl?
                    //  instead of prayer-debugging
                    `an error occurred compiling the shaders: ${this.gl_context.getShaderInfoLog(compiling_shader)}`, //again with the comma??? @mdn-tutorial pls
                );
            }
        }
    }
    
    initialise_shaders(){
        // ------------------------------------------------
        // ------------------------------------------------
        // ---- compile

        this.compile_shader(this.gl_context.VERTEX_SHADER);
        this.compile_shader(this.gl_context.FRAGMENT_SHADER);

        // ------------------------------------------------
        // ------------------------------------------------
        // ---- create the shader program

        this.shader_program = this.gl_context.createProgram();

        // ------------------------------------------------
        // ------------------------------------------------
        // ---- attach and link

        // create, then attach the parts, then link it to the canvas instance
        this.gl_context.attachShader(this.shader_program, this.vertex_compiled_shader);
        this.gl_context.attachShader(this.shader_program, this.fragment_compiled_shader);
        this.gl_context.linkProgram(this.shader_program);

        // ------------------------------------------------
        // ------------------------------------------------
        // ---- error reporting / cleanup our mess

        // if creating the shader program failed tell the user about it
        if( !this.gl_context.getProgramParameter(this.shader_program, this.gl_context.LINK_STATUS) ){
            console.log(
                `unable to init the shader program: ${this.gl_context.getProgramInfoLog(
                    this.shader_program
                )}`
            );
        }
        // otherwise clean up
        else {
            // now that it's linked, detach the prepared content
            this.gl_context.detachShader(this.shader_program, this.vertex_compiled_shader);
            this.gl_context.detachShader(this.shader_program, this.fragment_compiled_shader);
    
            // and delete it
            this.gl_context.deleteShader(this.vertex_compiled_shader);
            this.gl_context.deleteShader(this.fragment_compiled_shader);
        }
    }
    replace_shader_code( new_vertex_source, new_fragment_source ){
        // TODO: test this commented out code
        // // check we can skip?
        // if(this.vertex_source==new_vertex_source && this.fragment_source==new_fragment_source && this.shader_program!=null){
        //     // no need to do anything
        //     return;
        // }
        this.vertex_source = new_vertex_source;
        this.fragment_source = new_fragment_source;
        this.generate_shader_program();
        // when we need to refetch locations
        if(this.preserve_attributes_on_shader_replacement){
            this.rebind_attribute_locations();
        }
    }
    get_shader_program(){
        return this.shader_program;
    }
    get_vertex_source(){
        return this.vertex_source;
    }
    get_fragment_source(){
        return this.fragment_source;
    }

    // ###########################################
    // ###########################################

    // ###################################

    // tells the managed shader to prepare a buffer for our indices
    declare_managed_bindings(){
        this.indices_buffer = this.gl_context.createBuffer();
    }

    // assume we don't redo any, might have duplicates otherwise
    declare_managed_attribute_location( attribute_name ){
        let attribute_index = this.attribute_location_list.length;
        this.get_attribute_location( attribute_name );
        return attribute_index;
    }
    // assume we don't redo any, might have duplicates otherwise
    get_attribute_location( attribute_name ){
        let attribute_location = this.gl_context.getAttribLocation( this.shader_program, attribute_name );
        this.attribute_location_list.push( { name: attribute_name, location: attribute_location, buffer: this.gl_context.createBuffer() } );
        if(this.verbose_logging && attribute_location==-1){
            console.log(`shader determined attribute: '${attribute_name}' to be INACTIVE!`);
        }
        return attribute_location;
    }
    rebind_attribute_locations(){
        for (let index = 0; index < this.attribute_location_list.length; index++) {
            const attribute_name = this.attribute_location_list[index].name;
            this.attribute_location_list[index].location = this.gl_context.getAttribLocation( this.shader_program, attribute_name );
            if(this.verbose_logging && this.attribute_location_list[index].location==-1){
                console.log(`shader determined attribute: '${attribute_name}' to be INACTIVE!`);
            }
        }
    }
    get_attribute_location_by_index( attribute_index ){
        return this.attribute_location_list[attribute_index].location;
    }

    // ###################################

    enable_attributes(){
        this.attribute_location_list.forEach(attribute_data => {
            if(attribute_data.location!=-1) this.gl_context.enableVertexAttribArray(attribute_data.location);
        });
    }
    disable_attributes(){
        this.attribute_location_list.forEach(attribute_data => {
            if(attribute_data.location!=-1) this.gl_context.disableVertexAttribArray(attribute_data.location);
        });
    }

    // ###################################

    // ###########################################
    // ###########################################


    load_binding_buffer( bindings_data ){
        // prepare the index buffer as the one we're working on
        this.gl_context.bindBuffer(this.gl_context.ELEMENT_ARRAY_BUFFER, this.indices_buffer);
        // announce the data as our indices/bindings data
        this.gl_context.bufferData(
            this.gl_context.ELEMENT_ARRAY_BUFFER,
            bindings_data,
            this.gl_context.STATIC_DRAW
        );
    }


    /**
     * 
     * @param {*} attribute_index 
     * @param {*} attribute_data Float32Array
     * @param {*} values_per_element vec4 would be 4, and vec3 is 3
     */
    load_attribute_buffer_floats( attribute_index, attribute_data ){
        //TODO : test if active program before continuing
        // prepare abbreviated reference
        let target_attribute_data = this.attribute_location_list[attribute_index];

        // bind it
        this.gl_context.bindBuffer( this.gl_context.ARRAY_BUFFER, target_attribute_data.buffer);
        
        // load it
        this.gl_context.bufferData( this.gl_context.ARRAY_BUFFER, attribute_data, this.gl_context.STATIC_DRAW );

        // for use if we need to initialise as well
        return target_attribute_data;
    }



    /**
     * 
     * @param {*} attribute_index 
     * @param {*} attribute_data Float32Array
     * @param {*} values_per_element vec4 would be 4, and vec3 is 3, vec2 is 2, floats are 1
     */
    initialise_attribute_buffer_floats( attribute_index, attribute_data, values_per_element ){
        let target_attribute_data = this.load_attribute_buffer_floats( attribute_index, attribute_data );

        // point to it
        this.gl_context.vertexAttribPointer( target_attribute_data.location, values_per_element, this.gl_context.FLOAT, false, 0, 0 );
    }

    // ###########################################
    // ###########################################
}

// ############################################################################################
// ############################################################################################
// ############################################################################################
