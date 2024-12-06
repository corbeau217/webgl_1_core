import { Drawable_Scene_Object } from "../scene_objects/drawable_scene_object.js";
// import { VERTEX_SHADER_SRC as textured_vertex_source } from "../shaders/textured_sized_diffuse_vertex_shader.js";
import { FRAGMENT_SHADER_SRC as textured_fragment_source } from "../shaders/textured_sized_diffuse_fragment_shader.js";
import { Textured_Shape_Factory } from "../util/textured_shape_factory.js";
import { Vertex_Shader_Builder } from "../shader_util/vertex_shader_builder.js";


const UNLOADED_TEXTURE_DATA = new Uint8Array([0, 0, 255, 255]);

export class Textured_Shape_Factory_Scene_Object extends Drawable_Scene_Object {
    // ############################################################################################
    // ############################################################################################
    // ############################################################################################
    
    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * #### !! REPLACEMENT !!
     * 
     * prepares the shader sources using: `this.shader_source_data`
     * 
     * * the structure of `this.shader_source_data` is a string list containing the shaders in order
     *   of their usage
     * * *since WebGL 1 only has the `vertex` and `fragment` shaders, it'll just be those*
     * 
     *   **Items in this list are raw string values for compilation by the shader manager**
     *                  
     *   Ordering is reserved as:
     *   * `this.shader_source_data[0]` -> *vertex shader source*
     *   * `this.shader_source_data[1]` -> *fragment shader source*
     */
    fetch_required_resources(){
        this.vertex_source_builder = Vertex_Shader_Builder.build_vertex_shader(true,false,true,true);
        // specify our shader sources
        this.shader_source_data = {
            vertex_source:      this.vertex_source_builder.get_source(),
            fragment_source:    textured_fragment_source,
        };
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################
    
    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * 
     * used to prepare references and settings, ***minimal calculations*** and
     *      ***no function calls*** should be performed during this stage
     */
    initialise_pre_event(){
        super.initialise_pre_event();
        
        this.translation_vec = vec3.fromValues( 0, 0, 0 );
        this.rotation_vec = vec3.fromValues( 0.0, 0.0, 0.0 );
        this.scale_vec = vec3.fromValues( 1.0, 1.0, 1.0 );

        this.verbose_logging = true;


        this.textures = {
            url_source: [],
            image_data: [],
            gl_objects: [],
            count: 0,
            // as per the webgl specification
            units: [
                this.gl_context.TEXTURE0,
                this.gl_context.TEXTURE1,
                this.gl_context.TEXTURE2,
                this.gl_context.TEXTURE3,
                this.gl_context.TEXTURE4,
                this.gl_context.TEXTURE5,
                this.gl_context.TEXTURE6,
                this.gl_context.TEXTURE7,
            ],
            max: 8,
        };
    }
    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * 
     * used for initalising matrices and large setting information
     *      function calls are fine but should be limited as
     *      bloating this could cause excessive object creation
     *      overhead if we're creating and destroying objects often
     * 
     * this is where attribute locations are determined and the model shape is made
     *      which is handled by their respective functions
     */
    initialise_on_event(){
        super.initialise_on_event();

        // now add our textures here
        this.announce_texture_paths();
    }
    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * 
     * any operation that needs to happen during initialisation
     *      but requires that the object already have information
     *      ready to be used
     * 
     * this is effectively operations which arent part of initialisation
     *      but need to happen before the object is ready to be used
     */
    initialise_post_event(){
        super.initialise_post_event();

        // oh no, double handling, what are we to do??
        this.translation_mat = mat4.create();
        this.rotation_mat = mat4.create();
        this.scale_mat = mat4.create();

        // mmmm this is hard to decide, but it seems nice now
        mat4.translate(this.translation_mat, this.translation_mat, this.translation_vec);

        mat4.rotateY(this.rotation_mat, this.rotation_mat, this.rotation_vec[1]);
        mat4.rotateX(this.rotation_mat, this.rotation_mat, this.rotation_vec[0]);
        mat4.rotateZ(this.rotation_mat, this.rotation_mat, this.rotation_vec[2]);
        
        mat4.scale(this.scale_mat, this.scale_mat, this.scale_vec);
        
        // local translation
        mat4.multiply(this.model_matrix, this.model_matrix, this.translation_mat);
        
        // local rotation
        mat4.multiply(this.model_matrix, this.model_matrix, this.rotation_mat);

        // local scale
        mat4.multiply(this.model_matrix, this.model_matrix, this.scale_mat);

        this.initialise_textures();
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    /**
     * this is use by derived classes to call `this.add_texture_source(source_of_texture)`
     */
    announce_texture_paths(){
        // overriden by derived classes
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    /**
     * adds a texture source to be loaded into our shader
     * 
     * must be done after `super.initialisation_pre_event()`
     * but before `super.initialisation_post_event()`,
     * within derived classes
     * @param {*} source_of_texture 
     */
    add_texture_source(source_of_texture){
        this.textures.url_source.push(source_of_texture);
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    initialise_textures(){
        // --------------------------------------------------------
        // ---- helper methods for gathering data

        /**
         * builds a webgl texture object
         */
        let generate_new_texture_gl_object = (gl_context)=>{
            // ---- generate the texture
            let texture = this.gl_context.createTexture();
            // ---- select it as the active texture
            gl_context.bindTexture(gl_context.TEXTURE_2D, texture);
        
            // Because images have to be downloaded over the internet
            // they might take a moment until they are ready.
            // Until then put a single pixel in the texture so we can
            // use it immediately. When the image has finished downloading
            // we'll update the texture with the contents of the image.
            gl_context.texImage2D(
                gl_context.TEXTURE_2D,
                0,
                gl_context.RGBA,
                // width/height/border
                1, 1, 0,
                gl_context.RGBA,
                gl_context.UNSIGNED_BYTE,
                UNLOADED_TEXTURE_DATA
            );

            // ---- give it up
            return texture;
        };
        // ---------------------------------------------------------
        let is_power_of_2 = (value)=>{
            return (value & (value - 1)) === 0;
        };
        // ---------------------------------------------------------
        /**
         * builds the onload function for our texture
         * @param {*} gl_context 
         * @param {*} gl_texture 
         * @param {*} image_object 
         * @returns 
         */
        let prepare_onload_function = (gl_context, gl_texture, image_object) => {
            // ----------------------------
            return () =>{
                // select as current texture
                gl_context.bindTexture(gl_context.TEXTURE_2D, gl_texture);
                // replace it with the data we found
                gl_context.texImage2D(
                    gl_context.TEXTURE_2D,
                    0,
                    this.gl_context.RGBA,
                    this.gl_context.RGBA,
                    this.gl_context.UNSIGNED_BYTE,
                    image_object
                );
            
                // WebGL1 has different requirements for power of 2 images
                // vs non power of 2 images so check if the image is a
                // power of 2 in both dimensions.
                if (is_power_of_2(image_object.width) && is_power_of_2(image_object.height)) {
                    // Yes, it's a power of 2. Generate mips.
                    gl_context.generateMipmap(gl_context.TEXTURE_2D);
                } else {
                    // No, it's not a power of 2. Turn off mips and set
                    // wrapping to clamp to edge
                    gl_context.texParameteri(gl_context.TEXTURE_2D, gl_context.TEXTURE_WRAP_S, gl_context.CLAMP_TO_EDGE);
                    gl_context.texParameteri(gl_context.TEXTURE_2D, gl_context.TEXTURE_WRAP_T, gl_context.CLAMP_TO_EDGE);
                    // gl_context.texParameteri(gl_context.TEXTURE_2D, gl_context.TEXTURE_MIN_FILTER, gl_context.LINEAR);
                }
            };
            // ----------------------------
        };
        // ---------------------------------------------------------
        /**
         * setup the image for handling itself
         * @param {*} gl_context 
         * @param {*} gl_texture 
         * @param {*} image_source 
         * @returns 
         */
        let setup_new_texture_image = ( gl_context, gl_texture, image_source )=>{
            let image_object = new Image();
            // provide what to do when it's loaded
            image_object.onload = prepare_onload_function( gl_context, gl_texture, image_object );
            // designate the source
            image_object.src = image_source;
            // give back
            return image_object;
        };
        // ---------------------------------------------------------
        // ---------------------------------------------------------


        // --------------------------------------------------------
        // ---- preparing our textures

        // all the announced texture sources
        for (let texture_index = 0; texture_index < this.textures.url_source.length && this.textures.count < this.textures.max; texture_index++) {
            const current_texture_source = this.textures.url_source[texture_index];
            
            // prepare the texture as unloaded empty texture
            let current_texture = generate_new_texture_gl_object(this.gl_context);
            // add to our texture list
            this.textures.gl_objects.push( current_texture );
            
            // set it up as a real texture
            // TODO: possibility that this has an issue when our shader isnt the currently active shader
            let image_object = setup_new_texture_image( this.gl_context, current_texture, current_texture_source );
            // add to our list
            this.textures.image_data.push(image_object);
            // include it in the count
            this.textures.count += 1;
        }
        // unlikely  but possible
        if(this.textures.count==this.textures.max){
            console.log("!!! at maximum textures, weird things happen here !!!");
        }

        // ---------------------------------------------------------
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    
    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * #### !! replacement !!
     * 
     * sometimes referred to as `load_mesh_data` in other files 
     *      but we wanted a more explanatory name
     */
    generate_mesh_data(){
        // --------------------------------------------------------
        // ---- helper methods for gathering data

        let empty_or_defined = (list)=>{
            return (list!=undefined)? list : [];
        };
        let zero_or_defined = (value)=>{
            return (value!=undefined)? value : 0;
        };
        
        // --------------------------------------------------------

        this.mesh_shape = this.prepare_shape();
        
        // --------------------------------------------------------
        this.vertex_positions = empty_or_defined(this.mesh_shape.vertex_positions);
        // --------------------------------------------------------
        this.vertex_bindings = empty_or_defined(this.mesh_shape.vertex_bindings);
        // --------------------------------------------------------
        this.vertex_colours = empty_or_defined(this.mesh_shape.vertex_colours);
        // --------------------------------------------------------
        this.vertex_sizes = empty_or_defined(this.mesh_shape.vertex_sizes);
        // --------------------------------------------------------
        this.vertex_normals = empty_or_defined(this.mesh_shape.vertex_normals);
        // --------------------------------------------------------
        this.vertex_uv_mappings = empty_or_defined(this.mesh_shape.vertex_uv_mappings);
        // --------------------------------------------------------
        this.mesh_data = {
            // ==========================================
            vertices: zero_or_defined(this.mesh_shape.vertex_count),
            edges: zero_or_defined(this.mesh_shape.edge_count),
            faces: zero_or_defined(this.mesh_shape.face_count),
            // ==========================================
            colours: zero_or_defined(this.mesh_shape.colour_count),
            sizes: zero_or_defined(this.mesh_shape.size_count),
            normals: zero_or_defined(this.mesh_shape.normal_count),
            // ==========================================
            uv_mappings: zero_or_defined(this.mesh_shape.uv_mapping_count),
            // ==========================================
        };


        // --------------------------------------------------------
    }
    /**
     * overriden in derived classes
     */
    prepare_shape(){
        return Shape_Factory_Scene_Object.prepare_shape_mesh();
    }

    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * 
     * to map the location of attributes within our shader
     */
    initialise_mesh_attribute_locations(){
        super.initialise_mesh_attribute_locations();
        // then announce other data for each vertex
        this.vertex_uv_mappings_attribute_index  = this.managed_shader.declare_managed_attribute_location( "a_vertex_uv_mapping"   );
        this.vertex_sizes_attribute_index        = this.managed_shader.declare_managed_attribute_location( "a_vertex_size"         );
        this.vertex_normals_attribute_index      = this.managed_shader.declare_managed_attribute_location( "a_vertex_normal"       );
    }
    
    // ############################################################################################
    // ############################################################################################
    // ############################################################################################
    
    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * 
     * prepare the WebGL friendly array types for all our data
     */
    initialise_gl_arrays(){
        super.initialise_gl_arrays();
        // prepare the webgl friendly data types for all our information
        this.vertex_uv_mappings_float_array   = new Float32Array( this.vertex_uv_mappings   );
        this.vertex_sizes_float_array         = new Float32Array( this.vertex_sizes         );
        this.vertex_normals_float_array       = new Float32Array( this.vertex_normals       );
    }
    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * 
     * for use in the initialisation step to prepare our attribute buffers with size information
     */
    initialise_attribute_data(){
        super.initialise_attribute_data();
        this.managed_shader.initialise_attribute_buffer_floats( this.vertex_uv_mappings_attribute_index,  this.vertex_uv_mappings_float_array,   2 );
        this.managed_shader.initialise_attribute_buffer_floats( this.vertex_sizes_attribute_index,        this.vertex_sizes_float_array,         1 );
        this.managed_shader.initialise_attribute_buffer_floats( this.vertex_normals_attribute_index,      this.vertex_normals_float_array,       3 );
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * 
     * for use by our object during run time to update the data within our buffers
     */
    update_attribute_data(){
        super.update_attribute_data();
        // and the new ones
        this.managed_shader.load_attribute_buffer_floats( this.vertex_uv_mappings_attribute_index,  this.vertex_uv_mappings_float_array   );
        this.managed_shader.load_attribute_buffer_floats( this.vertex_sizes_attribute_index,        this.vertex_sizes_float_array     );
        this.managed_shader.load_attribute_buffer_floats( this.vertex_normals_attribute_index,      this.vertex_normals_float_array   );
    }

    prepare_textures_for_draw(){
        // prepare textures
        for (let index = 0; index < this.textures.count; index++) {
            // 0 is TEXTURE0, 1 is TEXTURE1 and so on
            const current_texture = this.textures.gl_objects[index];
            const current_unit = this.textures.units[index];
            
            // Tell WebGL we want to affect the texture unit
            this.gl_context.activeTexture( current_unit );
            // Bind the texture to texture unit it should be
            this.gl_context.bindTexture(this.gl_context.TEXTURE_2D, current_texture);
            // Tell the shader we bound the texture to the texture unit
            this.gl_context.uniform1i( this.gl_context.getUniformLocation(this.shader, `u_texture_${index}`), index );
        }
    }
    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * #### !! replacement !!
     * 
     * handles preparing all our uniforms for drawing, and is called during each draw call
     */
    update_uniform_data(){
        super.update_uniform_data();
        this.gl_context.uniformMatrix4fv( this.gl_context.getUniformLocation(this.shader, "u_model_to_ndc_matrix"), false, this.temp_model_to_ndc_matrix );
        this.prepare_textures_for_draw();
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    /**
     * so we dont need to import shape factory on derived classes
     * @returns 
     */
    static make_shape_factory(){
        return new Textured_Shape_Factory();
    }
    /**
     * overriden in derived classes with data
     * @returns 
     */
    static prepare_shape_mesh(){
        // --------------------------------------------------------
        // ---- prepare shape factory

        let shape_factory = new this.make_shape_factory();

        // --------------------------------------------------------
        // ---- finished, give it back
        return shape_factory.shape_data;
    }


    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

}