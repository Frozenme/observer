window.onload = function () {
  var socket = io('http://localhost:3000');
  var sysInfo,
    //   Uptime = [],
      Times = [],
    //   LoadAverage,
    //   Tasks,
      Mems = [],
    //   Swaps = [],
      CachedMems = [];

  // cpu chart
  var us = [],
      sy = [],
      ni = [],
      id = [],
      wa = [],
      hi = [],
      si = [],
      st = [];
  var cpuChart = echarts.init(document.getElementById('cpu-chart'));
  var cpuOption = {
    legend: {
        data:['us','sy','ni','id','wa','hi','si','st']
    },
    xAxis: {
      data: Times,
      boundaryGap: false
    },
    yAxis: {
      name: '%',
      type: 'value'
    },
    series: [
      {
        name: 'us',
        type: 'line',
        smooth: true,
        showSymbol: false,
        hoverAnimation: false,
        data: us
      },
      {
        name: 'sy',
        type: 'line',
        smooth: true,
        showSymbol: false,
        hoverAnimation: false,
        data: sy
      },
      {
        name: 'ni',
        type: 'line',
        smooth: true,
        showSymbol: false,
        hoverAnimation: false,
        data: ni
      },
      {
        name: 'id',
        type: 'line',
        smooth: true,
        showSymbol: false,
        hoverAnimation: false,
        data: id
      },
      {
        name: 'wa',
        type: 'line',
        smooth: true,
        showSymbol: false,
        hoverAnimation: false,
        data: wa
      },
      {
        name: 'hi',
        type: 'line',
        smooth: true,
        showSymbol: false,
        hoverAnimation: false,
        data: hi
      },
      {
        name: 'si',
        type: 'line',
        smooth: true,
        showSymbol: false,
        hoverAnimation: false,
        data: si
      },
      {
        name: 'st',
        type: 'line',
        smooth: true,
        showSymbol: false,
        hoverAnimation: false,
        data: st
      },
    ]
  };

  // mem chart
  var used = [],
      free = [],
      buffers = [];

  var memChart = echarts.init(document.getElementById('mem-chart'));
  var memOption = {
    legend: {
        data: ['used', 'free', 'buffers']
    },
    xAxis: {
      data: Times,
      boundaryGap: false
    },
    yAxis: {
      name: 'KiB',
      type: 'value'
    },
    series: [
      {
        name: 'used',
        type: 'line',
        smooth: true,
        showSymbol: false,
        hoverAnimation: false,
        data: used
      },
      {
        name: 'free',
        type: 'line',
        smooth: true,
        showSymbol: false,
        hoverAnimation: false,
        data: free
      },
      {
        name: 'buffers',
        type: 'line',
        smooth: true,
        showSymbol: false,
        hoverAnimation: false,
        data: buffers
      },
    ]
  };

  // cache chart
  var cacheChart = echarts.init(document.getElementById('cache-chart'));
  var cacheOption = {
    xAxis: {
      data: Times,
      boundaryGap: false
    },
    yAxis: {
      name: 'KiB',
      type: 'value'
    },
    series: [
      {
        name: 'CachedMems',
        type: 'line',
        smooth: true,
        showSymbol: false,
        hoverAnimation: false,
        data: CachedMems
      }
    ]
  }

  function parseCpu(data) {
    us.push(data[0] * 1);
    sy.push(data[1] * 1);
    ni.push(data[2] * 1);
    id.push(data[3] * 1);
    wa.push(data[4] * 1);
    hi.push(data[5] * 1);
    si.push(data[6] * 1);
    st.push(data[7] * 1);
    cpuChart.setOption(cpuOption);
  }

  function parseMem(data) {
    used.push(data[1] * 1);
    free.push(data[2] * 1);
    buffers.push(data[3] * 1);
    memChart.setOption(memOption);
  }

  function parseCache(data) {
    CachedMems.push(data * 1);
    cacheChart.setOption(cacheOption);
  }

  function showTime(data) {
    document.getElementById('time').getElementsByTagName('span')[0].innerHTML = data;
  }

  function showUpTime(data) {
    document.getElementById('uptime').getElementsByTagName('span')[0].innerHTML = data;
  }

  function showLoadAverage(data) {
    document.getElementById('loadaverage').innerHTML = data[0];
  }

  function showTasks(data) {
    document.getElementById('run').getElementsByTagName('span')[0].innerHTML = data[0];
    document.getElementById('sleep').getElementsByTagName('span')[0].innerHTML = data[1];
    document.getElementById('stop').getElementsByTagName('span')[0].innerHTML = data[2];
    document.getElementById('zombie').getElementsByTagName('span')[0].innerHTML = data[3];
  }

  function parseOnline(count, cities) {
    var container = document.getElementById('online');
    var str = '';
    str += '<li>在线人数: ' + count + '</li>'; 
    for (key in cities) {
      str += '<li>' + key + ':' + cities[key] + '人</li>';
    }
    container.innerHTML = str;
  }

  socket.on('sysInfo', function (data) {
    console.log(data);
    sysInfo = data.data;
    if (sysInfo) {
      var time = sysInfo.match(/top\s*\-\s*(\d+\:\d+\:\d+)/)[1];
      Times.push(time);
      showTime(time);
      var uptime = sysInfo.match(/up\s*(\d+\s*days,\s*\d+\:\d+)/).slice(1);
      showUpTime(uptime);
      var loadaverage = sysInfo.match(/load\s*average\:\s*(\d+\.\d+),\s*(\d+\.\d+),\s*(\d+\.\d+)/).slice(1);
      showLoadAverage(loadaverage);
      var tasks = sysInfo.match(/Tasks\:\s*(\d+)\s*total,\s*(\d+)\s*running,\s*(\d+)\s*sleeping,\s*(\d+)\s*stopped,\s*(\d+)\szombie/).slice(1)
      showTasks(tasks);
      var cpu = sysInfo.match(/Cpu\(s\):\s*(\d+\.\d+)\s*us,\s*(\d+\.\d+)\s*sy,\s*(\d+\.\d+)\s*ni,\s*(\d+\.\d+)\s*id,\s*(\d+\.\d+)\s*wa,\s*(\d+\.\d+)\s*hi,\s*(\d+\.\d+)\s*si,\s*(\d+\.\d+)\s*st/).slice(1);
      parseCpu(cpu);
      var mem = sysInfo.match(/KiB\s*Mem\:\s*(\d+)\s*total,\s*(\d+)\s*used,\s*(\d+)\s*free,\s*(\d+)\s*buffers/).slice(1);
      parseMem(mem);
      // var swap = sysInfo.match(/KiB\sSwap\:\s*(\d+)\stotal,\s*(\d+)\sused,\s*(\d+)\sfree/).slice(1);
      // Swaps.push(swap);
      cachedMem = sysInfo.match(/(\d+)\s*cached\s*Mem/)[1];
      parseCache(cachedMem);
    }
    
    setTimeout(function () {
      getSysInfo();
    }, 5000);
  });

  socket.on('users', function (data) {
    var cities = data.cities && JSON.parse(data.cities);
    var count = data.count;

    if (count || cities) {
      parseOnline(count, cities);
    }

    setTimeout(function () {
      getUsers();
    }, 1000);
  });

  function getSysInfo() {
    socket.emit('getSysInfo', { my: 'data' });    
  }

  function getUsers() {
    socket.emit('getUsers', { my: 'data' });  
  }

  // mock query
  var data = {
    '李三': ['重庆邮电大学', '2013211xxx', '关于xxx问卷'],
    '张三': ['重庆大学', '2013211xxx', '关于xxx问卷'],
    '小明': ['重庆邮电大学', '2013211xxx', '关于xxx问卷'],
    '大白': ['重庆邮电大学', '2013211xxx', '关于xxx问卷'],
    '小黑': ['重庆工商大学', '2013211xxx', '关于xxx问卷']
  }

  document.getElementById('search').addEventListener('click', function () {
    var val = document.getElementsByTagName('input')[0].value;
    var result = data[val];
    if (result) {
      document.getElementById('result').innerHTML = '<div>' + val + '</div>' + '<div>' + result[0] + '</div>' + '<div>' + result[1] + '</div>' + '<div>' + result[2] + '</div>';
    }
  });
}