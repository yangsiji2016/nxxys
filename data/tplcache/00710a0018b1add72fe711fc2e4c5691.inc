<li class=''>
                    <a href="[field:arcurl/]">
                        <div class="time">
                            <div class="date">[field:pubdate function=strftime('%m-%d',@me)/]</div>
                            <div class="year">[field:pubdate function=strftime('%y',@me)/]</div>
                        </div>
                        <div class="textBox">
                            <div class="tit">{dede:field.seotitle /}</div>
                            <div class="text">[field:description function="cn_substr(@me,40)"/]...</div>
                        </div>
                        <div class="arrow"></div>
                    </a>
                </li>