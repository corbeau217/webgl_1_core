
import { Canvas_Stage } from "./canvas_stage.js";


// ############################################################################################
// ############################################################################################
// ############################################################################################

export class WebGL_App {
    constructor( maximum_fps ){
        this.canvas_stage_list = [];

        this.verbose_logging = true;
        this.maximum_fps = maximum_fps;
        this.time_between_frames = 1000.0/this.maximum_fps;
        this.hook_load_event();

        this.prepare_default_settings();
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    hook_load_event(){
        window.addEventListener( "load", (event)=>{
            if(this.verbose_logging){ console.log("--- preparing managed page content ---"); }
            this.page_main();
            
            if(this.verbose_logging){ console.log("--- preparing managed canvases ---"); }
            this.app_main();
    
            if(this.verbose_logging){ console.log("--- starting apps ---"); }
            this.start();
        } );
    }
    prepare_default_settings(){
        // TO BE OVERRIDEN IN DERIVED CLASSES
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    start(){
        // for use inside update loop closure
        let self_reference = this;
        // make update loop closure
        setInterval(
            function () {
                requestAnimationFrame(
                        (t) => {
                            self_reference.canvas_stage_list.forEach(app_instance => {
                                app_instance.frame_update( t );
                            });
                        }
                    );
            },
            this.time_between_frames
        );
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    page_main(){
        // override to include things
        if(this.verbose_logging){ console.log("initialising page..."); }
    }
    app_main(){
        // override to include things
        if(this.verbose_logging){ console.log("initialising canvases..."); }
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################

    create_new_canvas_stage( canvas_element_name ){
        if(this.verbose_logging){ console.log(`creating canvas with name '${canvas_element_name}'`); }
        // construct and add
        let new_stage = new Canvas_Stage( canvas_element_name, this );
        this.canvas_stage_list.push( new_stage );

        // give to caller 
        return new_stage;
    }

}

// ############################################################################################
// ############################################################################################
// ############################################################################################