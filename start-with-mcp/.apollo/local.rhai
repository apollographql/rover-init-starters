// At the supergraph_service stage, register callbacks for processing requests and
// responses.
fn supergraph_service(service) {
    const request_callback = Fn("process_request"); // This is standard Rhai functionality for creating a function pointer
    service.map_request(request_callback); // Register the request callback
}

fn process_request(request) {
    log_info("processing request"); // This will appear in the router log as an INFO log
    // Verify that x-custom-header is present and has the expected value
    // Put the header into the context and check the context in the response
    request.context["email"] = "test@apollographql.com";
}