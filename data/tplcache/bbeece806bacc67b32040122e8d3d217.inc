<li class=''>
                <a href="[field:arcurl/]">
                    <div class="time">
                        <div class="date">[field:pubdate function=strftime('%m-%d',@me)/]</div>
                        <div class="year">[field:pubdate function=strftime('%Y',@me)/]</div>
                    </div>
                    <div class="textBox">
                        <div class="tit">[field:title/]</div>
                        <div class="text">[field:body  function="cn_substr(@me,250)"/...</div>
                    </div>
                    <div class="arrow"></div>
                </a>
            </li>