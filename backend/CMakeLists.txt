cmake_minimum_required(VERSION 3.16)
project(MetamorphosisServer VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Dependencies
find_package(OpenSSL REQUIRED)
find_package(Threads REQUIRED)

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${OPENSSL_INCLUDE_DIR}
)

# Source files
set(SOURCES
    src/main.cpp
    src/auth.cpp
    src/storage.cpp
    src/user_manager.cpp
)

add_executable(metamorphosis_server ${SOURCES})

target_link_libraries(metamorphosis_server
    PRIVATE
    argon2
    OpenSSL::SSL
    OpenSSL::Crypto
    Threads::Threads
)

set_target_properties(metamorphosis_server PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/bin"
)
