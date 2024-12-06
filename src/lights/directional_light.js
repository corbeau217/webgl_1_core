import { Light } from "./light.js";

export class Directional_Light extends Light {

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
            direction: vec4.fromValues( 4.0, 3.0, -3.5, 0.0 ),
        };
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
        this.initialise_post_event();
        
        // (static) normalize(out, a) → {vec4}
        // Normalize a vec4 
        vec4.normalize(this.light_properties.direction, this.light_properties.direction);
    }

    // ############################################################################################
    // ############################################################################################
    // ############################################################################################
    
}