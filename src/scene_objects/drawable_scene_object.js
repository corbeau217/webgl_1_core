import { Scene_Object } from "./scene_object.js";
import { Shader_Manager } from "../shader_util/shader_engine.js";

export class Drawable_Scene_Object extends Scene_Object {
    // ############################################################################################
    // ############################################################################################
    // ############################################################################################
    
    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * #### !! REPLACEMENT !!
     * 
     * prepares the shader sources using: `this.shader_source_data`
     * 
     * * the structure of `this.shader_source_data` is a JSON containing the shader code as strings
     * * *since WebGL 1 only has the `vertex` and `fragment` shaders, it'll just be those*
     * 
     *   Ordering is reserved as:
     *   * `this.shader_source_data.vertex_source`
     *   * `this.shader_source_data.fragment_source`
     */
    fetch_required_resources(){
        this.shader_source_data = {
            vertex_source: "",
            fragment_source: "",
        };
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################
    
    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * #### !! REPLACEMENT !!
     * 
     * operations that happen during the construction of this object
     *      this is mostly reserved for preparing our shader code to use
     *      in our shader program
     * 
     * at this stage the shader program is not yet setup, and any mesh information
     *      has been deferred to the initialisation event
     */
    construction_on_event(){
        // gather our shader
        this.shader_manager = Shader_Manager.get_instance();
        this.managed_shader = this.shader_manager.new_shader( this.gl_context, this.shader_source_data.vertex_source, this.shader_source_data.fragment_source );
        this.shader = this.managed_shader.get_shader_program();
        // select shader as being used
        this.gl_context.useProgram(this.shader);
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################
    
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

        // find the location of our attributes in shader
        this.initialise_mesh_attribute_locations();

        // prepare the information about our mesh
        this.generate_mesh_data();
    }
    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * #### !! REPLACEMENT !!
     * 
     * any operation that needs to happen during initialisation
     *      but requires that the object already have information
     *      ready to be used
     * 
     * this is effectively operations which arent part of initialisation
     *      but need to happen before the object is ready to be used
     */
    initialise_post_event(){
        // puts our mesh data in the form of WebGL arrays
        this.initialise_gl_arrays();
        // loads the initial mesh data into the buffers they belong and readies them
        //  to be used
        this.initialise_attribute_data();
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    /**
     * sometimes referred to as `load_mesh_data` in other files 
     *      but we wanted a more explanatory name
     */
    generate_mesh_data(){
        // --------------------------------------------------------
        this.mesh_data = {
            vertices: 0,
            edges: 0,
            faces: 0,
        };
        // --------------------------------------------------------
    }
    /**
     * to map the location of attributes within our shader
     */
    initialise_mesh_attribute_locations(){
        // announce they're managing our bindings
        this.managed_shader.declare_managed_bindings();
        // then announce the data for each vertex 
        this.vertex_position_attribute_index = this.managed_shader.declare_managed_attribute_location( "a_vertex_position" );
    }
    
    // ############################################################################################
    // ############################################################################################
    // ############################################################################################
    
    /**
     * prepare the WebGL friendly array types for all our data
     */
    initialise_gl_arrays(){
        // prepare the webgl friendly data types for all our information
        this.vertex_bindings_int_array    = new Uint16Array(  this.vertex_bindings  );
        this.vertex_positions_float_array = new Float32Array( this.vertex_positions );
    }
    /**
     * for use in the initialisation step to prepare our attribute buffers with size information
     */
    initialise_attribute_data(){
        this.managed_shader.load_binding_buffer( this.vertex_bindings_int_array );
        this.managed_shader.initialise_attribute_buffer_floats( this.vertex_position_attribute_index, this.vertex_positions_float_array, 4 );
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    /**
     * for use by our object during run time to update the data within our buffers
     */
    update_attribute_data(){
        this.managed_shader.load_binding_buffer( this.vertex_bindings_int_array );
        this.managed_shader.load_attribute_buffer_floats( this.vertex_position_attribute_index, this.vertex_positions_float_array );
    }
    /**
     * handles preparing all our uniforms for drawing, and is called during each draw call
     */
    update_uniform_data(){
        // TO BE OVERRIDEN BY DERIVED CLASS
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    /**
     * ### OVERRIDE OF SUPER FUNCTION
     * #### !! REPLACEMENT !!
     * 
     * draw this object using the already prepared `temp_model_to_ndc_matrix`
     */
    draw_self(){
        // select shader as being used
        this.gl_context.useProgram(this.shader);
        this.managed_shader.enable_attributes();
        // enable attribute data if it isnt already
        this.update_attribute_data();
        this.update_uniform_data();
        // update uniform data, incase it wasnt
        // draw call
        if(this.mesh_data.faces > 0)    this.gl_context.drawElements(this.gl_context.TRIANGLES, this.mesh_data.faces*3,  this.gl_context.UNSIGNED_SHORT, 0);
        if(this.mesh_data.edges > 0)    this.gl_context.drawElements(this.gl_context.LINES,     this.mesh_data.edges*2,  this.gl_context.UNSIGNED_SHORT, 0);
        if(this.mesh_data.vertices > 0) this.gl_context.drawElements(this.gl_context.POINT,     this.mesh_data.vertices, this.gl_context.UNSIGNED_SHORT, 0);
        // finish with drawing in our context
        this.managed_shader.disable_attributes();
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################
}