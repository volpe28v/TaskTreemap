for y in 0..504
  for x in 0..480
    val = rand(2000)/100.to_f
    val = rand(1000) > 1 ? 0 : val
    if y >= 0 then
      print "#{val},"
    else
      print "0,"
    end
  end
  puts
end
