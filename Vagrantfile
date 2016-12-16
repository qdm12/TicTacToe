Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.provider "virtualbox" do |vb|
    vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
    #vb.gui = true
    vb.memory = "1024"
    vb.cpus = 1
  end
  config.vm.provision "shell", inline: <<-SHELL
    sudo apt-get update
    sudo apt-get install -y git build-essential
    curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
    sudo apt-get install -y nodejs
    sudo apt-get -y autoremove
    cd /vagrant
    sudo npm install --no-optional --no-bin-links
    # Make vi look nice
    echo "colorscheme desert" > ~/.vimrc
  SHELL
end