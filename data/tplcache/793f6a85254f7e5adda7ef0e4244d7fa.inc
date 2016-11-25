<a href="[field:arcurl/]" class="bigNew">
                <div class='imgs'>[field:image/]</div>
                <div class="time">
                    <div class="date">[field:pubdate function=strftime('%m-%d',@me)/]</div>
                    <div class="year">[field:pubdate function=strftime('%Y',@me)/]</div>
                </div>
                <div class="textBox">
                    <div class="tit">[field:title/]</div>
                    <div class="text">[field:description function="cn_substr(@me,80)"/]...</div>
                    <div class="lookMore">查看详情</div>
                </div>
            </a>