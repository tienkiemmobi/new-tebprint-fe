#!/usr/bin/expect -f

# Initialize variables
set passphrase ""
set factorySitename ""

proc readEnvFile {filename} {
    set file [open $filename r]
    while {[gets $file line] != -1} {
        if {[regexp {^PASSPHRASE=(.*)$} $line match password]} {
            set ::passphrase $password
        } elseif {[regexp {^FACTORY_SITENAME=(.*)$} $line match user]} {
            set ::factorySitename $user
        }
    }
    close $file
}

if {[file exists .env.cicd]} {
    spawn echo "Found .env.cicd file"
    readEnvFile .env.cicd
} else {
    spawn echo "No .env.cicd file found"
}

# If vars are not in .env.cicd, use environment variables from github action
if { $passphrase == "" } {
    set passphrase $env(PASSPHRASE)
}

if { $factorySitename == "" } {
    set factorySitename $env(FACTORY_SITENAME)
}

# Check if required variables are provided
if { $passphrase == "" || $factorySitename == "" } {
    puts "Passphrase or Fulfill Sitename not provided. Exiting."
    exit 1
}

spawn echo "Deploying $factorySitename..."

spawn git pull -f

expect {
    "*passphrase*" {
        send "$passphrase\r"
        exp_continue
    }
    eof
}

spawn pnpm i
expect eof

spawn pnpm build:fac
set timeout 300
expect {
    "*Time:*" {
        puts "Build process completed for $factorySitename"
    }
    timeout {
        puts "Build process timed out after 5 minutes."
        # You might want to handle any cleanup or error handling here
        exit
    }
}
expect eof

# Stop and delete the current pm2 process
spawn sh -c "pm2 stop $factorySitename"
expect eof
spawn sh -c "pm2 delete $factorySitename"
expect eof

# Start the process using pm2
spawn sh -c "cd ./apps/factory && pm2 start ./dist/server/entry.mjs -f --name $factorySitename"
expect eof

# Save the pm2 process list
spawn sh -c "pm2 save"
expect eof

sleep 4

# Get the PID of the pm2 process and save it to the pid file for Aapanel nodjes website (make website's status is running)
spawn sh -c "cd ./apps/factory && pm2 pid $factorySitename"
expect {
    -re "(\\d+)" {
        set pid $expect_out(1,string)
        puts "PID of the process: $pid"

        # Save the PID to a file
        set pidFilePath "/www/server/nodejs/vhost/pids/$factorySitename.pid"
        exec echo $pid > $pidFilePath
        puts "PID saved to $pidFilePath"
    }
    eof
}
