import { Scene_Graph } from "./scene_graph.js";

// ############################################################################################
// ############################################################################################
// ############################################################################################


//   0.0 to 1.0:                    [   R,   G,   B,   A ]
const canvas_default_clear_colour = [ 0.1, 0.1, 0.1, 1.0 ];

export class Canvas_Stage {

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    constructor( canvas_name, webgl_page_manager ){
        this.construction_event( canvas_name, webgl_page_manager );
        this.perform_initialisation_event();
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    construction_event( canvas_name, webgl_page_manager ){
        // save the name of the canvas
        this.canvas_name = canvas_name;
        // save reference to our manager
        this.webgl_page_manager = webgl_page_manager;

        // get the canvas element
        this.canvas_element = document.querySelector(`#${canvas_name}`);

        // get webgl context
        this.gl_context =  this.canvas_element.getContext("webgl");
        
        this.aspect_ratio = this.canvas_element.width/this.canvas_element.height;

        // save our clear colour
        this.canvas_clear_colour = canvas_default_clear_colour;

        // prepare time
        this.old_time = Date.now();

        this.scene_graph = new Scene_Graph( this.gl_context );
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    /**
     * initialisation event
     */
    perform_initialisation_event(){
        this.scene_graph.perform_initialisation_event();
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    get_scene_graph(){
        return this.scene_graph;
    }
    get_gl_context(){
        return this.gl_context;
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################


    frame_update( new_time ){
        // ... generate delta time
        const delta_time = (new_time - this.old_time)/1000.0;
        this.old_time = new_time;
        
        // give back self reference after:
        // 
        // do update
        //      prepare context
        //      do draw
        return this.content_update(delta_time)
                    .prepare_context()
                    .content_draw();
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################


    content_update( delta_time ){
        this.scene_graph.update( delta_time );

        // give back reference
        return this;
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################


    // prepares for drawing
    prepare_context(){
        this.gl_context.clearColor(this.canvas_clear_colour[0], this.canvas_clear_colour[1], this.canvas_clear_colour[2], this.canvas_clear_colour[3]); // clear to black
        this.gl_context.clearDepth(1.0); // clear everything
    
        this.gl_context.enable(this.gl_context.DEPTH_TEST); // enable depth testing
        this.gl_context.depthFunc(this.gl_context.LEQUAL); // near things obscure far things
        
        this.gl_context.enable(this.gl_context.CULL_FACE);
        this.gl_context.cullFace(this.gl_context.FRONT);
        
        this.gl_context.enable(this.gl_context.BLEND);
        this.gl_context.blendFunc(this.gl_context.SRC_ALPHA, this.gl_context.ONE_MINUS_SRC_ALPHA);
        // this.gl_context.blendFunc(this.gl_context.ONE, this.gl_context.ONE_MINUS_SRC_ALPHA);

        // give back reference
        return this;
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################


    content_draw(){
        // draw the scene
        this.scene_graph.draw_from_camera();

        // give back reference
        return this;
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################
}

// ############################################################################################
// ############################################################################################
// ############################################################################################
