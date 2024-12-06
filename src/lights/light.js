import { Scene_Object } from "../scene_objects/scene_object";

export class Light extends Scene_Object {

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

        this.light_properties = {
            ambient: {
                material:  vec4.fromValues( 1.00, 1.00, 1.00, 1.0 ),
                intensity: vec4.fromValues( 0.20, 0.20, 0.20, 1.0 ),
            },
            diffuse: {
                material:  vec4.fromValues( 1.00, 1.00, 1.00, 1.0 ),
                intensity: vec4.fromValues( 0.75, 0.75, 0.75, 1.0 ),
            },
        };
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################
    
}