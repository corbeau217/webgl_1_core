
import { Managed_Shader } from "./managed_shader.js";


// ############################################################################################
// ############################################################################################
// ############################################################################################





// 1.  new shader is created by calling gl.createShader()
// 2. the shaders source code is sent to the shader by calling gl.shaderSource()
// 3. once the shader has the source code, it's compiled using gl.compileShader()
// 4. to check to be sure the shader successfully compiled, the shader param gl.COMPILE_STATUS is checked
//      to get its value we call gl.getShaderParameter() specifying the shader and the name of the parameter to check
//      if it's false, we know it failed to compile so show alert with log information obtained from compiler
//          using gl.getShaderInfoLog(), then delete the shader and return null to indicate failure to load shader
// 5. if shader was loaded and successfully compiled, the compiled shader is returned to caller
//.
// but also add the `const shaderProgram = initShaderProgram(vsSource, fsSource)` to main


// create a shader of the given type, uploads the source and compiles it
function loadShader( gl_context, type, source){
    // ask the canvas instance for shader instance
    const shader = gl_context.createShader(type);

    // send the source to the shader object

    gl_context.shaderSource(shader, source);

    // compile the shader program

    gl_context.compileShader(shader);

    // see if it compiled successfully

    if( !gl_context.getShaderParameter(shader, gl_context.COMPILE_STATUS) ){ // seems we can get a lot from canvas elements
        console.log(
            // very interesting that theres' an info log, does this mean we can debug webgl irl?
            //  instead of prayer-debugging
            `an error occurred compiling the shaders: ${gl_context.getShaderInfoLog(shader)}`, //again with the comma??? @mdn-tutorial pls
        );
        // scammed, give junk
        return null;
    }

    // happy give
    return shader;
}



// ############################################################################################
// ############################################################################################
// ############################################################################################




// init a shader program, so WebGL knows how to draw our data
export function generate_shader_program( gl_context, vsSourceIn, fsSourceIn ){

    const vertexShader = loadShader(gl_context, gl_context.VERTEX_SHADER, vsSourceIn);
    const fragmentShader = loadShader(gl_context, gl_context.FRAGMENT_SHADER, fsSourceIn);

    // ------------------------------------------------
    // ------------------------------------------------

    // create the shader program

    // create, then attach the parts, then link it to the canvas instance
    const shaderProgram = gl_context.createProgram();
    gl_context.attachShader(shaderProgram, vertexShader);
    gl_context.attachShader(shaderProgram, fragmentShader);
    gl_context.linkProgram(shaderProgram);

    // if creating the shader program failed tell the user about it
    if( !gl_context.getProgramParameter(shaderProgram, gl_context.LINK_STATUS) ){
        console.log(
            `unable to init the shader program: ${gl_context.getProgramInfoLog( // this is vry cool tbh, i likey
                shaderProgram, // another comma??? @mdn-tutorial pls why r u like this
            )}`, // why the comma @mdn-tutorial??
        );
        // give them junk
        return null;
    }

    // now that it's linked, detach the prepared content
    gl_context.detachShader(shaderProgram, vertexShader);
    gl_context.detachShader(shaderProgram, fragmentShader);

    // and delete it
    gl_context.deleteShader(vertexShader);
    gl_context.deleteShader(fragmentShader);

    // happy handoff now
    return shaderProgram;
}



// ############################################################################################
// ############################################################################################
// ############################################################################################

let shader_manager_instance;
export class Shader_Manager {
    /**
     * singleton pattern for the shader manager since we keep making multiple managers per context
     * @returns shader manager instance
     */
    static get_instance(){
        if(shader_manager_instance==undefined){
            shader_manager_instance = new Shader_Manager();
        }
        return shader_manager_instance;
    }
    constructor(){
        // the data about our shaders
        this.shader_data_list = [];
    }
    new_shader( gl_context, vertex_shader_source, fragment_shader_source ){
        // id of the shader
        let shader_id = this.shader_data_list.length;

        // prepare our managed shader
        let managed_shader = new Managed_Shader( shader_id, gl_context, vertex_shader_source, fragment_shader_source );
        managed_shader.initialise();

        // add to our list
        this.shader_data_list.push(managed_shader);
        // give back the shader data
        return managed_shader;
    }
    get_managed_shader( shader_index ){
        // assume good index
        return this.shader_data_list[shader_index];
    }
    get_shader_program( shader_index ){
        return this.shader_data_list[shader_index].get_shader_program();
    }
    get_vertex_source( shader_index ){
        return this.shader_data_list[shader_index].get_vertex_source();
    }
    get_fragment_source( shader_index ){
        return this.shader_data_list[shader_index].get_fragment_source();
    }
}

// ############################################################################################
// ############################################################################################
// ############################################################################################
