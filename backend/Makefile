CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2 -I./include -I./src
LDFLAGS = -largon2 -lssl -lcrypto -lpthread

SRCS = src/main.cpp src/auth.cpp src/storage.cpp src/user_manager.cpp
OBJS = $(SRCS:.cpp=.o)
TARGET = bin/metamorphosis_server

.PHONY: all clean run setup

all: setup $(TARGET)

setup:
	@mkdir -p bin data

$(TARGET): $(OBJS)
	$(CXX) $(OBJS) -o $(TARGET) $(LDFLAGS)
	@echo "=========================================="
	@echo "Build successful: $(TARGET)"
	@echo "=========================================="

src/%.o: src/%.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

run: all
	@echo "Starting Metamorphosis C++ Backend Server..."
	./$(TARGET)

clean:
	rm -f src/*.o $(TARGET)
