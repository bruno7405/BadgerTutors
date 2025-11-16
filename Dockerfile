# Use Ubuntu as base image for Anchor/Solana development
FROM ubuntu:22.04

# Set environment variables to avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive
ENV RUSTUP_HOME=/usr/local/rustup
ENV CARGO_HOME=/usr/local/cargo
ENV PATH=$CARGO_HOME/bin:$PATH

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    pkg-config \
    libssl-dev \
    build-essential \
    libudev-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Rust toolchain
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable

# Install Solana CLI (latest stable version)
RUN sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Add Solana to PATH
ENV PATH="/root/.local/share/solana/install/active_release/bin:$PATH"

# Install Anchor CLI (version 0.29.0 to match project dependencies)
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Set AVM home and add to PATH
ENV AVM_HOME=/root/.avm
ENV PATH="$AVM_HOME/bin:$PATH"

# Install and use Anchor 0.29.0
RUN avm install 0.29.0 && \
    avm use 0.29.0

# Set working directory
WORKDIR /workspace

# Copy project files
COPY Cargo.toml ./
COPY Cargo.lock ./
COPY Anchor.toml ./
COPY src ./src
COPY programs ./programs

# Copy any test files if they exist
COPY tests ./tests 2>/dev/null || true

# Verify installations
RUN rustc --version && \
    cargo --version && \
    solana --version && \
    anchor --version

# Set the default command to a shell
CMD ["/bin/bash"]

